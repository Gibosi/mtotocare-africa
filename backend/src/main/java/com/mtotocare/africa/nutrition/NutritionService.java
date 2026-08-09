package com.mtotocare.africa.nutrition;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mtotocare.africa.allergy.Allergy;
import com.mtotocare.africa.allergy.AllergyRepository;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.common.AIClient;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NutritionService {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final ChildRepository childRepository;
    private final AllergyRepository allergyRepository;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate a new full-day meal plan for the child.
     * Returns 4 meals (BREAKFAST, LUNCH, DINNER, SNACK) for the given date.
     * Persists the plan to the DB so subsequent fetches return the same data.
     *
     * Regenerating produces a genuinely different plan each time instead of
     * the old fixed, age-bracket-only lookup:
     *  1. It first tries the real AI provider — varied, allergy-aware, and
     *     told what the previous plan was so it doesn't just repeat itself.
     *  2. If the AI is unavailable (no provider configured, or the call/parse
     *     fails), it falls back to a rotating set of curated meal variants
     *     per age bracket, keyed off how many times this child's plan has
     *     been generated before — so "Regenerate" always changes something
     *     even without an AI provider configured.
     */
    @Transactional
    public List<NutritionPlanDto> generateDaily(Long childId, LocalDate date) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));

        Integer ageMonths = child.getAgeInMonths();
        String feedingFrequency = getFeedingFrequency(ageMonths);
        String foodsToAvoid = getFoodsToAvoid(ageMonths);

        // Capture what the last plan looked like (for AI "don't repeat this" context)
        // before we deactivate it.
        List<NutritionPlan> previousActive = nutritionPlanRepository.findByChildIdAndActiveTrue(childId);
        String previousTitles = previousActive.stream()
                .map(NutritionPlan::getMealName)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.joining(", "));

        // Deactivate any existing plans for this child on the same date
        previousActive.forEach(p -> { p.setActive(false); nutritionPlanRepository.save(p); });

        List<String> allergens = allergyRepository.findByChildIdOrderByDiagnosedAtDesc(childId).stream()
                .map(Allergy::getAllergen)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        long generationCount = nutritionPlanRepository.countByChildId(childId);

        List<Meal> meals = tryGenerateWithAI(child, ageMonths, allergens, previousTitles);
        if (meals == null) {
            // Rotate through curated variants so regenerating actually changes
            // the plan even without an AI provider configured.
            List<List<Meal>> variants = getMealVariantsForAge(ageMonths);
            int variantIndex = (int) (generationCount % variants.size());
            meals = variants.get(variantIndex);
        }

        List<NutritionPlanDto> plans = new ArrayList<>();
        for (Meal meal : meals) {
            NutritionPlan entity = NutritionPlan.builder()
                    .child(child)
                    .ageRange(getAgeRange(ageMonths))
                    .planDate(date)
                    .mealType(meal.mealType)
                    .mealName(meal.title)
                    .description(meal.description)
                    .caloriesKcal(meal.calories)
                    .recommendations(meal.description)
                    .foodsToInclude(meal.ingredientsCsv)
                    .foodsToAvoid(foodsToAvoid)
                    .feedingFrequency(feedingFrequency)
                    .active(true)
                    .build();
            nutritionPlanRepository.save(entity);

            plans.add(NutritionPlanDto.from(
                    child, date,
                    meal.mealType, meal.title, meal.description, meal.ingredientsCsv,
                    meal.calories,
                    feedingFrequency, foodsToAvoid));
        }
        log.info("Generated {} meals for child {} on {}", plans.size(), childId, date);
        return plans;
    }

    /**
     * Ask the configured LLM for a fresh, varied, age- and allergy-aware
     * meal plan. Returns null (never throws) if the AI is unavailable, the
     * response can't be parsed, or it doesn't contain all 4 meal types —
     * the caller falls back to the curated rotation in that case.
     */
    private List<Meal> tryGenerateWithAI(Child child, Integer ageMonths, List<String> allergens, String previousTitles) {
        try {
            StringBuilder system = new StringBuilder();
            system.append("You are a pediatric nutrition planner for MtotoCare, a child-health app used in Tanzania. ");
            system.append("Generate a single day's meal plan (BREAKFAST, LUNCH, DINNER, SNACK) appropriate for the child's age, ");
            system.append("using foods realistically available in Tanzania. ");
            system.append("Respond with ONLY raw JSON (no markdown fences, no commentary) in this exact shape: ");
            system.append("{\"meals\":[{\"mealType\":\"BREAKFAST\",\"title\":\"...\",\"description\":\"...\",");
            system.append("\"ingredients\":[\"...\"],\"calories\":123}, ... 4 entries total, one per mealType]}. ");
            system.append("Vary the specific foods each time you're asked so the plan doesn't feel repetitive.");

            StringBuilder user = new StringBuilder();
            user.append("Child age: ").append(ageMonths == null ? "unknown" : ageMonths).append(" months. ");
            user.append("Gender: ").append(child.getGender()).append(". ");
            if (!allergens.isEmpty()) {
                user.append("Known allergies — MUST avoid these ingredients entirely: ")
                        .append(String.join(", ", allergens)).append(". ");
            }
            if (previousTitles != null && !previousTitles.isBlank()) {
                user.append("The previous plan's meals were: ").append(previousTitles)
                        .append(". Generate something noticeably different this time. ");
            }
            user.append("Return only the JSON object described in the system prompt.");

            String raw = aiClient.chatWithPrompts(system.toString(), user.toString());
            if (raw == null || raw.isBlank()) return null;

            String json = raw.trim();
            int start = json.indexOf('{');
            int end = json.lastIndexOf('}');
            if (start < 0 || end < 0 || end < start) return null;
            json = json.substring(start, end + 1);

            JsonNode root = objectMapper.readTree(json);
            JsonNode mealsNode = root.get("meals");
            if (mealsNode == null || !mealsNode.isArray()) return null;

            List<Meal> parsed = new ArrayList<>();
            for (JsonNode m : mealsNode) {
                String mealType = textOrNull(m, "mealType");
                String title = textOrNull(m, "title");
                String description = textOrNull(m, "description");
                if (mealType == null || title == null || description == null) continue;
                List<String> ingredients = new ArrayList<>();
                JsonNode ing = m.get("ingredients");
                if (ing != null && ing.isArray()) {
                    ing.forEach(i -> ingredients.add(i.asText()));
                }
                int calories = m.has("calories") ? m.get("calories").asInt(0) : 0;
                parsed.add(new Meal(mealType.toUpperCase(), title, description,
                        String.join(", ", ingredients), calories));
            }

            List<String> requiredTypes = List.of("BREAKFAST", "LUNCH", "DINNER", "SNACK");
            List<String> gotTypes = parsed.stream().map(mm -> mm.mealType).collect(Collectors.toList());
            if (!gotTypes.containsAll(requiredTypes)) return null;

            return parsed;
        } catch (Exception e) {
            log.warn("AI nutrition generation failed, falling back to curated plan: {}", e.getMessage());
            return null;
        }
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return (v == null || v.isNull()) ? null : v.asText();
    }

    /**
     * Get today's plan for a child, auto-generating one if none exists yet.
     * Unlike before, this now reads the real persisted per-meal fields
     * (mealType/mealName/description/caloriesKcal) instead of re-deriving
     * generic placeholder data on every call.
     */
    @Transactional
    public List<NutritionPlanDto> getOrCreateDaily(Long childId, LocalDate date) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));

        List<NutritionPlan> active = nutritionPlanRepository.findByChildIdAndActiveTrue(childId);
        if (!active.isEmpty()) {
            return active.stream()
                    .map(p -> NutritionPlanDto.from(
                            child,
                            p.getPlanDate() != null ? p.getPlanDate() : date,
                            p.getMealType(),
                            p.getMealName(),
                            p.getDescription() != null ? p.getDescription() : p.getRecommendations(),
                            p.getFoodsToInclude(),
                            p.getCaloriesKcal() != null ? p.getCaloriesKcal() : 0,
                            p.getFeedingFrequency(),
                            p.getFoodsToAvoid()))
                    .collect(Collectors.toList());
        }
        return generateDaily(childId, date);
    }

    /**
     * Get a week's worth of meal plans starting from the given date. Returns
     * whatever plans have actually been generated/persisted for each day in
     * the range (via generateDaily/getOrCreateDaily) — it does not force-
     * generate plans for days that don't have one yet, since "weekly" is a
     * historical/planning view over what's already there, not a bulk
     * generator. Call getOrCreateDaily for a specific day first if you want
     * it included.
     */
    @Transactional(readOnly = true)
    public List<NutritionPlanDto> getWeekly(Long childId, LocalDate startDate) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        LocalDate endDate = startDate.plusDays(6);
        String feedingFrequency = getFeedingFrequency(child.getAgeInMonths());
        return nutritionPlanRepository.findByChildIdAndPlanDateBetweenOrderByPlanDateAsc(childId, startDate, endDate)
                .stream()
                .map(p -> NutritionPlanDto.from(
                        child,
                        p.getPlanDate() != null ? p.getPlanDate() : startDate,
                        p.getMealType(),
                        p.getMealName(),
                        p.getDescription() != null ? p.getDescription() : p.getRecommendations(),
                        p.getFoodsToInclude(),
                        p.getCaloriesKcal() != null ? p.getCaloriesKcal() : 0,
                        feedingFrequency,
                        p.getFoodsToAvoid()))
                .collect(Collectors.toList());
    }

    /** Internal helper record for meal data — avoids the int/String array mess. */
    private static class Meal {
        final String mealType;
        final String title;
        final String description;
        final String ingredientsCsv;
        final int calories;
        Meal(String mealType, String title, String description, String ingredientsCsv, int calories) {
            this.mealType = mealType;
            this.title = title;
            this.description = description;
            this.ingredientsCsv = ingredientsCsv;
            this.calories = calories;
        }
    }

    /**
     * Curated fallback plans used when no AI provider is configured (or the
     * call fails). Each age bracket now has THREE distinct variants instead
     * of one fixed plan, and generateDaily() rotates through them based on
     * how many times this child's plan has already been generated — so
     * "Regenerate" reliably produces a different result each time even
     * offline.
     */
    private List<List<Meal>> getMealVariantsForAge(Integer ageMonths) {
        if (ageMonths == null) return List.of(defaultMeals(), defaultMealsB(), defaultMealsC());
        if (ageMonths < 6) return List.of(under6MealsA(), under6MealsB(), under6MealsC());
        if (ageMonths < 12) return List.of(m6to12A(), m6to12B(), m6to12C());
        if (ageMonths < 24) return List.of(m12to24A(), m12to24B(), m12to24C());
        if (ageMonths < 60) return List.of(m24to60A(), m24to60B(), m24to60C());
        return List.of(defaultMeals(), defaultMealsB(), defaultMealsC());
    }

    private List<Meal> under6MealsA() {
        return List.of(
            new Meal("BREAKFAST", "Morning feed",
                "Continue exclusive breastfeeding on demand. Offer both breasts, ~10-15 minutes each.",
                "Breast milk", 120),
            new Meal("LUNCH", "Midday feed",
                "Breast milk on demand. Watch for hunger cues: rooting, sucking on hands.",
                "Breast milk", 120),
            new Meal("DINNER", "Evening feed",
                "Continue breastfeeding as the main nutrition source.",
                "Breast milk", 120),
            new Meal("SNACK", "Cluster feed",
                "Smaller, more frequent feeds. Skin-to-skin contact helps milk supply.",
                "Breast milk", 80)
        );
    }
    private List<Meal> under6MealsB() {
        return List.of(
            new Meal("BREAKFAST", "Early morning feed",
                "Breastfeed on waking. Alternate starting breast each feed to keep supply even.",
                "Breast milk", 120),
            new Meal("LUNCH", "Afternoon feed",
                "Feed in a calm, quiet spot. Burp halfway through and after.",
                "Breast milk", 120),
            new Meal("DINNER", "Bedtime feed",
                "A longer, unhurried feed before the longest sleep stretch.",
                "Breast milk", 130),
            new Meal("SNACK", "Top-up feed",
                "Short comfort feed if unsettled between main feeds.",
                "Breast milk", 70)
        );
    }
    private List<Meal> under6MealsC() {
        return List.of(
            new Meal("BREAKFAST", "Wake-up feed",
                "Full feed after waking; watch for a relaxed, open hand as a sign baby is satisfied.",
                "Breast milk", 125),
            new Meal("LUNCH", "Midday feed",
                "Feed on demand; expect 6-8+ wet nappies/day as a good hydration sign.",
                "Breast milk", 120),
            new Meal("DINNER", "Evening cluster feeds",
                "Babies often cluster-feed in the evening — this is normal, not a supply problem.",
                "Breast milk", 120),
            new Meal("SNACK", "Settling feed",
                "Brief feed to help baby settle; keep the room calm and dim.",
                "Breast milk", 75)
        );
    }

    private List<Meal> m6to12A() {
        return List.of(
            new Meal("BREAKFAST", "Iron-fortified cereal",
                "Mix 2-3 tbsp of iron-fortified cereal with breast milk or formula. Add mashed banana for variety.",
                "Iron-fortified cereal, Mashed banana, Breast milk", 180),
            new Meal("LUNCH", "Vegetable puree",
                "Sweet potato or carrot puree (smooth, no lumps). Continue breastfeeding after.",
                "Sweet potato, Carrot, Breast milk", 200),
            new Meal("DINNER", "Fruit puree",
                "Mashed ripe pear or apple. Introduce one new food at a time, wait 3 days before next.",
                "Pear, Apple", 150),
            new Meal("SNACK", "Soft fruit",
                "Small pieces of ripe banana or papaya for finger food practice.",
                "Banana, Papaya", 80)
        );
    }
    private List<Meal> m6to12B() {
        return List.of(
            new Meal("BREAKFAST", "Mashed avocado & egg yolk",
                "Ripe mashed avocado with a little boiled egg yolk mixed in for healthy fats and iron.",
                "Avocado, Egg yolk", 190),
            new Meal("LUNCH", "Pumpkin & lentil mash",
                "Well-cooked pumpkin mashed with soft lentils. Continue breastfeeding after.",
                "Pumpkin, Lentils, Breast milk", 210),
            new Meal("DINNER", "Mashed potato & spinach",
                "Soft mashed potato with finely chopped, well-cooked spinach and a drop of oil.",
                "Potato, Spinach, Oil", 200),
            new Meal("SNACK", "Steamed papaya",
                "Small soft pieces of ripe papaya for self-feeding practice.",
                "Papaya", 70)
        );
    }
    private List<Meal> m6to12C() {
        return List.of(
            new Meal("BREAKFAST", "Millet porridge",
                "Thin millet porridge enriched with a spoon of groundnut paste and breast milk.",
                "Millet, Groundnut paste, Breast milk", 185),
            new Meal("LUNCH", "Fish & sweet potato mash",
                "Flaked, deboned fish mashed with soft sweet potato.",
                "Fish, Sweet potato", 220),
            new Meal("DINNER", "Carrot & bean puree",
                "Soft-cooked carrots and beans, blended smooth with a little oil.",
                "Carrot, Beans, Oil", 200),
            new Meal("SNACK", "Mashed banana",
                "Ripe mashed banana, offered on a small spoon.",
                "Banana", 75)
        );
    }

    private List<Meal> m12to24A() {
        return List.of(
            new Meal("BREAKFAST", "Oatmeal with egg",
                "Soft oatmeal with mashed boiled egg yolk and a few drops of cooking oil. Mashed ripe fruit on the side.",
                "Oatmeal, Egg yolk, Banana, Oil", 300),
            new Meal("LUNCH", "Rice, beans & vegetables",
                "Soft rice with mashed beans, well-cooked spinach or pumpkin. Add a teaspoon of oil/fat.",
                "Rice, Beans, Spinach, Pumpkin, Oil", 400),
            new Meal("DINNER", "Ugali with fish",
                "Soft ugali with flaked fish (no bones) and cooked vegetables. Continue breastfeeding.",
                "Ugali, Fish, Sukuma wiki, Oil", 350),
            new Meal("SNACK", "Fruit & yogurt",
                "Plain yogurt with mashed fruit (banana, mango, papaya).",
                "Yogurt, Banana, Mango", 150)
        );
    }
    private List<Meal> m12to24B() {
        return List.of(
            new Meal("BREAKFAST", "Chapati with egg",
                "Small pieces of soft chapati with scrambled egg and a few slices of tomato.",
                "Chapati, Egg, Tomato", 310),
            new Meal("LUNCH", "Chicken & rice stew",
                "Soft-cooked rice with shredded chicken, carrots, and a small amount of oil.",
                "Rice, Chicken, Carrot, Oil", 420),
            new Meal("DINNER", "Beans & mashed pumpkin",
                "Mashed beans with pumpkin, seasoned mildly.",
                "Beans, Pumpkin", 340),
            new Meal("SNACK", "Sliced mango",
                "Small soft pieces of ripe mango for finger feeding.",
                "Mango", 140)
        );
    }
    private List<Meal> m12to24C() {
        return List.of(
            new Meal("BREAKFAST", "Sweet potato porridge",
                "Mashed sweet potato mixed into thick porridge with a spoon of milk.",
                "Sweet potato, Porridge, Milk", 290),
            new Meal("LUNCH", "Fish, rice & greens",
                "Soft rice with deboned fish and well-cooked amaranth or spinach.",
                "Rice, Fish, Amaranth greens, Oil", 400),
            new Meal("DINNER", "Lentil & vegetable stew",
                "Soft lentils cooked with carrots and pumpkin, mildly seasoned.",
                "Lentils, Carrot, Pumpkin", 330),
            new Meal("SNACK", "Yogurt with papaya",
                "Plain yogurt mixed with small pieces of ripe papaya.",
                "Yogurt, Papaya", 150)
        );
    }

    private List<Meal> m24to60A() {
        return List.of(
            new Meal("BREAKFAST", "Porridge & egg",
                "Thick millet or maize porridge with a boiled egg, sliced avocado, and a cup of milk.",
                "Maize porridge, Egg, Avocado, Milk", 400),
            new Meal("LUNCH", "Family meal",
                "What the family eats: rice/ugali + beans/fish/meat + vegetables + fruit. Cut into small pieces.",
                "Rice, Beans, Fish, Vegetables, Orange", 500),
            new Meal("DINNER", "Light dinner",
                "Sweet potato with peanut butter and a glass of milk. Avoid heavy/spicy food before bed.",
                "Sweet potato, Peanut butter, Milk", 400),
            new Meal("SNACK", "Fruit & nuts",
                "Sliced fruit (banana, mango) with a few crushed groundnuts or peanuts (no whole nuts - choking risk).",
                "Banana, Mango, Groundnuts", 200)
        );
    }
    private List<Meal> m24to60B() {
        return List.of(
            new Meal("BREAKFAST", "Chapati & bean stew",
                "Chapati with a small bowl of bean stew and a cup of milk.",
                "Chapati, Beans, Milk", 420),
            new Meal("LUNCH", "Pilau with vegetables",
                "Mild pilau rice with meat or chicken, plus a side of cooked greens.",
                "Rice, Chicken or beef, Vegetables", 520),
            new Meal("DINNER", "Vegetable soup & bread",
                "Warm vegetable soup with a small piece of bread.",
                "Vegetables, Bread", 380),
            new Meal("SNACK", "Roasted groundnuts & orange",
                "Crushed roasted groundnuts with orange segments.",
                "Groundnuts, Orange", 210)
        );
    }
    private List<Meal> m24to60C() {
        return List.of(
            new Meal("BREAKFAST", "Egg sandwich",
                "Soft bread with scrambled egg and sliced tomato, plus a glass of milk.",
                "Bread, Egg, Tomato, Milk", 410),
            new Meal("LUNCH", "Ugali, fish & greens",
                "Ugali with grilled or fried fish (deboned) and sukuma wiki.",
                "Ugali, Fish, Sukuma wiki, Oil", 510),
            new Meal("DINNER", "Rice & lentil curry",
                "Mildly spiced lentil curry over soft rice.",
                "Rice, Lentils, Vegetables", 390),
            new Meal("SNACK", "Fruit salad",
                "Mixed diced fruit — banana, papaya, watermelon.",
                "Banana, Papaya, Watermelon", 190)
        );
    }

    private List<Meal> defaultMeals() {
        return List.of(
            new Meal("BREAKFAST", "Balanced breakfast",
                "Whole-grain bread or porridge, eggs, fruit, milk.",
                "Bread, Egg, Banana, Milk", 400),
            new Meal("LUNCH", "Balanced lunch",
                "Carb (rice/ugali/chapati) + protein (beans/meat/fish) + vegetables + fruit.",
                "Rice, Beans, Vegetables, Orange", 600),
            new Meal("DINNER", "Light dinner",
                "Soup, sandwich, or a small portion of the family meal.",
                "Bread, Soup, Vegetables", 500),
            new Meal("SNACK", "Healthy snack",
                "Fruit, yogurt, or nuts. Avoid sugary snacks and soda.",
                "Apple, Yogurt", 200)
        );
    }
    private List<Meal> defaultMealsB() {
        return List.of(
            new Meal("BREAKFAST", "Cereal & fruit", "Whole-grain cereal with milk and sliced fruit.", "Cereal, Milk, Banana", 380),
            new Meal("LUNCH", "Chicken & vegetables", "Grilled chicken, rice, and steamed vegetables.", "Chicken, Rice, Vegetables", 580),
            new Meal("DINNER", "Vegetable stir-fry", "Mixed vegetable stir-fry with a small portion of rice.", "Vegetables, Rice, Oil", 480),
            new Meal("SNACK", "Nuts & fruit", "A handful of mixed nuts with fresh fruit.", "Nuts, Orange", 190)
        );
    }
    private List<Meal> defaultMealsC() {
        return List.of(
            new Meal("BREAKFAST", "Eggs & toast", "Scrambled eggs with whole-grain toast and avocado.", "Egg, Bread, Avocado", 410),
            new Meal("LUNCH", "Fish & greens", "Grilled fish with ugali and sautéed greens.", "Fish, Ugali, Greens", 560),
            new Meal("DINNER", "Bean stew", "Bean stew with a small portion of rice.", "Beans, Rice, Tomato", 470),
            new Meal("SNACK", "Yogurt & berries", "Plain yogurt topped with fruit.", "Yogurt, Fruit", 180)
        );
    }

    private String getAgeRange(Integer months) {
        if (months == null) return "Unknown";
        if (months < 6) return "0-6 months";
        if (months < 12) return "6-12 months";
        if (months < 24) return "12-24 months";
        if (months < 60) return "2-5 years";
        return "5+ years";
    }

    private String getFeedingFrequency(Integer months) {
        if (months == null) return "3 meals + 2 snacks";
        if (months < 6) return "On demand, 8-12 feeds/day";
        if (months < 12) return "3-4 milk feeds + 2 solid meals";
        if (months < 24) return "3 meals + 2 snacks + continued breastfeeding";
        return "3 family meals + 2 healthy snacks";
    }

    private String getFoodsToAvoid(Integer months) {
        if (months == null || months < 12) {
            return "Honey (risk of botulism), added sugar, cow's milk as main drink, hard foods (nuts, whole grapes) that cause choking";
        }
        if (months < 24) {
            return "Excess sugar, salty processed snacks, whole nuts, soft drinks, unpasteurized juice";
        }
        return "Excess sugar, processed/junk food, sugary drinks, excessive juice, very spicy food";
    }
}
