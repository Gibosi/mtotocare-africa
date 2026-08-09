package com.mtotocare.africa.ai;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.common.AIClient;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final AIConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final AIClient aiClient;

    private static final String MEDICAL_DISCLAIMER_EN =
        "\n\n⚠️ **Important**: This information is for general guidance only. " +
        "Always consult a qualified healthcare provider for medical advice specific to your child.";

    private static final String MEDICAL_DISCLAIMER_SW =
        "\n\n⚠️ **Muhimu**: Maelezo haya ni mwongozo wa jumla tu. " +
        "Daima shauriana na mtoa huduma wa afya aliyehitimu kwa ushauri maalum wa mtoto wako.";

    private static final String EMERGENCY_RESPONSE_EN =
        "🚨 **This sounds like a medical emergency.** Please go to the nearest health facility IMMEDIATELY or call emergency services. " +
        "If your child has: difficulty breathing, unconsciousness, severe bleeding, high fever with rash, or seizures, seek help NOW.";

    private static final String EMERGENCY_RESPONSE_SW =
        "🚨 **Hii inaonekana kama dharura ya kiafya.** Tafadhali nenda kituo cha afya kilicho karibu SASA au piga simu ya huduma za dharura.";

    private static final Pattern EMERGENCY_KEYWORDS = Pattern.compile(
        "\\b(emergency|choking|unconscious|seizure|bleeding|not breathing|severe pain|poisoning|overdose|" +
        "dharura|anayefema|hazitoi kupumua|anashindwa kupumua|kushindwa kupumua|kuzirai|kiharusi|damu|kusumbua|trobedi|magurudhi|mwili|maiti|" +
        "breathless|won't wake|won't breathe|can't breathe|stopped breathing|blue lips|convulsion)\\b",
        Pattern.CASE_INSENSITIVE
    );

    @Transactional
    public AIChatMessageDto chat(AIChatRequest request) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("Not authenticated", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"));

        long startTime = System.currentTimeMillis();
        String language = (request.getLanguage() == null || request.getLanguage().isBlank()) ? "en" : request.getLanguage();
        String sanitizedMessage = sanitizeMessage(request.getMessage());

        // Check for emergencies first
        if (EMERGENCY_KEYWORDS.matcher(sanitizedMessage).find()) {
            String body = "sw".equals(language) ? EMERGENCY_RESPONSE_SW : EMERGENCY_RESPONSE_EN;
            return saveAndBuild(user, request, body, "EMERGENCY", language, startTime);
        }

        String intent = detectIntent(sanitizedMessage);
        Child child = request.getChildId() != null ? childRepository.findById(request.getChildId()).orElse(null) : null;
        StringBuilder context = new StringBuilder();
        if (child != null) {
            context.append("sw".equals(language) ? "Mtoto wako ana miezi " : "Your child is ");
            context.append(child.getAgeInMonths());
            context.append(" sw".equals(language) ? " (" : " months old (");
            context.append("MALE".equals(child.getGender()) ? (("sw".equals(language)) ? "mvulana" : "boy") : (("sw".equals(language)) ? "msichana" : "girl"));
            context.append("). ");
        }
        context.append(sanitizedMessage);

        // Try the real LLM first; fall back to the safe offline response.
        String response = callRealAI(context.toString(), request.getChildId(), language);
        if (response == null || response.isBlank()) {
            response = generateSafeResponse(sanitizedMessage, language, intent, child);
        }
        return saveAndBuild(user, request, response, intent, language, startTime);
    }

    /**
     * Streaming variant of chat(). Pushes text chunks to the sink as
     * the AI provider generates them. Falls back to the offline canned
     * response if the provider is unavailable.
     */
    @Transactional
    public void streamChat(AIChatRequest request, AiStreamSink sink) {
        try {
            User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                    .orElseThrow(() -> new ApiException("Not authenticated", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"));

            long startTime = System.currentTimeMillis();
            String language = (request.getLanguage() == null || request.getLanguage().isBlank()) ? "en" : request.getLanguage();
            String sanitizedMessage = sanitizeMessage(request.getMessage());
            Child child = request.getChildId() != null ? childRepository.findById(request.getChildId()).orElse(null) : null;

            // Emergency check (send full answer immediately)
            if (EMERGENCY_KEYWORDS.matcher(sanitizedMessage).find()) {
                String body = "sw".equals(language) ? EMERGENCY_RESPONSE_SW : EMERGENCY_RESPONSE_EN;
                String[] chunks = body.split("(?<= )");
                StringBuilder acc = new StringBuilder();
                for (String c : chunks) {
                    acc.append(c);
                    sink.onChunk(c);
                    Thread.sleep(15);
                }
                AIChatMessageDto finalMsg = saveAndBuild(user, request, acc.toString(), "EMERGENCY", language, startTime);
                sink.onDone(finalMsg);
                return;
            }

            String intent = detectIntent(sanitizedMessage);
            StringBuilder context = new StringBuilder();
            if (child != null) {
                context.append("sw".equals(language) ? "Mtoto wako ana miezi " : "Your child is ");
                context.append(child.getAgeInMonths());
                context.append(" sw".equals(language) ? " (" : " months old (");
                context.append("MALE".equals(child.getGender()) ? ("sw".equals(language) ? "mvulana" : "boy") : ("sw".equals(language) ? "msichana" : "girl"));
                context.append("). ");
            }
            context.append(sanitizedMessage);

            // Try streaming from the real LLM
            final StringBuilder accumulator = new StringBuilder();
            java.util.function.Consumer<String> chunkConsumer = chunk -> {
                accumulator.append(chunk);
                sink.onChunk(chunk);
            };
            boolean streamed = aiClient.streamChatWithPrompts(
                    buildSystemPrompt(language, child), context.toString(), chunkConsumer);

            String fullResponse;
            if (!streamed || accumulator.length() == 0) {
                // Fall back to offline response, streamed chunk-by-chunk
                fullResponse = generateSafeResponse(sanitizedMessage, language, intent, child);
                String[] chunks = fullResponse.split("(?<= )");
                StringBuilder fb = new StringBuilder();
                for (String c : chunks) {
                    fb.append(c);
                    sink.onChunk(c);
                    try { Thread.sleep(15); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                }
                fullResponse = fb.toString();
            } else {
                fullResponse = accumulator.toString();
            }
            AIChatMessageDto finalMsg = saveAndBuild(user, request, fullResponse, intent, language, startTime);
            sink.onDone(finalMsg);
        } catch (Throwable t) {
            log.warn("AI stream failed: {}", t.getMessage());
            sink.onError(t);
        }
    }

    private String buildSystemPrompt(String language, Child child) {
        boolean sw = "sw".equals(language);
        StringBuilder system = new StringBuilder();
        system.append(sw
                ? "Wewe ni MtotoCare AI, msaidizi wa afya ya mtoto kwa wazazi nchini Tanzania. "
                : "You are MtotoCare AI, a child-health assistant for parents in Tanzania. ");
        system.append("Answer briefly, clearly, and with empathy. Keep answers under 150 words. ");
        if (child != null) {
            int ageMonths = child.getAgeInMonths();
            String gender = child.getGender();
            if (sw) {
                system.append("Mtoto wa mteja ana miezi ").append(ageMonths).append(" (")
                        .append("MALE".equals(gender) ? "mvulana" : "msichana").append("). ");
            } else {
                system.append("The user's child is ").append(ageMonths).append(" months old (")
                        .append("MALE".equals(gender) ? "boy" : "girl").append("). ");
            }
        }
        return system.toString();
    }

    private AIChatMessageDto saveAndBuild(User user, AIChatRequest request, String response, String intent, String language, long startTime) {
        AIConversation convo = AIConversation.builder()
                .user(user)
                .childId(request.getChildId())
                .sessionId(request.getSessionId())
                .userMessage(request.getMessage())
                .aiResponse(response)
                .intent(intent)
                .language(language)
                .durationMs(System.currentTimeMillis() - startTime)
                .build();
        AIConversation saved = conversationRepository.save(convo);
        return AIChatMessageDto.builder()
                .id(saved.getId())
                .userId(user.getId())
                .role("assistant")
                .content(response)
                .intent(intent)
                .language(language)
                .durationMs(System.currentTimeMillis() - startTime)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<AIChatMessageDto> getHistory() {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("Not authenticated", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"));
        return conversationRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(AIChatMessageDto::assistant)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void clearHistory() {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("Not authenticated", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"));
        conversationRepository.deleteByUserId(user.getId());
    }

    private String sanitizeMessage(String input) {
        if (input == null) return "";
        // Remove any potential prompt injection markers
        return input.replaceAll("(?i)(ignore previous|system:|assistant:)", "")
                .replaceAll("[\\r\\n]+", " ")
                .trim();
    }

    private String detectIntent(String message) {
        String lower = message.toLowerCase(Locale.ROOT);
        if (lower.contains("vaccin") || lower.contains("chanjo")) return "VACCINATION";
        if (lower.contains("food") || lower.contains("eat") || lower.contains("nutrition") || lower.contains("chakula")) return "NUTRITION";
        if (lower.contains("fever") || lower.contains("temperature") || lower.contains("homa")) return "FEVER";
        if (lower.contains("growth") || lower.contains("weight") || lower.contains("height") || lower.contains("ukuaji")) return "GROWTH";
        if (lower.contains("pregnan") || lower.contains("mimba") || lower.contains("expecting")) return "PREGNANCY";
        if (lower.contains("cough") || lower.contains("cold") || lower.contains("kikohozi")) return "COUGH_COLD";
        if (lower.contains("diarr") || lower.contains("kuharisha")) return "DIARRHEA";
        return "GENERAL";
    }

    private String generateSafeResponse(String message, String language, String intent, Child child) {
        boolean isSwahili = "sw".equals(language);
        StringBuilder response = new StringBuilder();
        String disclaimer = isSwahili ? MEDICAL_DISCLAIMER_SW : MEDICAL_DISCLAIMER_EN;

        if (child != null) {
            Integer ageMonths = child.getAgeInMonths();
            response.append(isSwahili
                ? "Kwa mtoto wako wa miezi " + ageMonths + ":\n\n"
                : "For your " + ageMonths + "-month-old child:\n\n");
        }

        switch (intent) {
            case "VACCINATION":
                response.append(isSwahili
                    ? "Chanjo ni muhimu kwa kulinda mtoto wako dhidi ya magonjwa. " +
                      "Tanzania ina mpango wa chanjo wa EPI unaojumuisha chanjo 13 za msingi. " +
                      "Hakikisha unafuata ratiba ya chanjo iliyopendekezwa. " +
                      "Wasiliana na kituo cha afya kilicho karibu kwa ratiba kamili."
                    : "Vaccinations protect your child from serious diseases. " +
                      "Tanzania's EPI schedule includes 13 essential vaccines. " +
                      "Follow the recommended timeline. " +
                      "Contact your nearest health facility for the complete schedule.");
                break;
            case "NUTRITION":
                response.append(isSwahili
                    ? "Lishe bora ni muhimu kwa ukuaji wa mtoto. " +
                      "Watoto chini ya miezi 6 wanahitaji maziwa ya mama pekee. " +
                      "Baada ya hapo, anza na vyakula vya ziada wakati huo huo. " +
                      "Jumuisha mboga, matunda, nafaka, na protini katika lishe yao."
                    : "Good nutrition is essential for child development. " +
                      "Children under 6 months need exclusive breastfeeding. " +
                      "After that, introduce complementary foods while continuing breastfeeding. " +
                      "Include vegetables, fruits, grains, and protein in their diet.");
                break;
            case "FEVER":
                response.append(isSwahili
                    ? "Homa ni dalili ya maambukizi. Kwa watoto chini ya miezi 3, wasiliana na daktari HARAKA. " +
                      "Kwa watoto wakubwa, kama homa ni juu ya 38°C, vipaumbele ni: kumpa maji mengi, " +
                      "kumvisha mavazi mepesi, na kumhudumia kwa upendo. Tafuta huduma ya afya kama homa inadumu zaidi ya siku 3."
                    : "Fever is a sign of infection. For children under 3 months, contact a doctor IMMEDIATELY. " +
                      "For older children, if fever is above 38°C, prioritize: giving plenty of fluids, " +
                      "dressing them lightly, and providing loving care. Seek medical care if fever persists beyond 3 days.");
                break;
            case "GROWTH":
                response.append(isSwahili
                    ? "Kufuatilia ukuaji wa mtoto wako ni muhimu. Nenda kliniki kwa kila chanjo kwa kupima uzito na urefu. " +
                      "Tumia chati za WHO kwa umri wa mtoto wako kuhakikisha ana ukuaji wa kawaida."
                    : "Tracking your child's growth is important. Visit the clinic at each vaccination for weight and height checks. " +
                      "Use WHO charts for your child's age to ensure normal growth.");
                break;
            case "PREGNANCY":
                response.append(isSwahili
                    ? "Hongera kwa ujauzito! Nenda kliniki ya mama mjamzito mara kwa mara. " +
                      "Kula vizuri, pumzika vya kutosha, na kuchukua vitamin za ujauzito. " +
                      "Tafuta huduma ya afya mara moja kwa dalili zozote za hatari."
                    : "Congratulations on your pregnancy! Attend antenatal clinic regularly. " +
                      "Eat well, rest adequately, and take prenatal vitamins. " +
                      "Seek healthcare immediately for any danger signs.");
                break;
            case "COUGH_COLD":
                response.append(isSwahili
                    ? "Kikohozi na mafua ni kawaida kwa watoto. Hakikisha mtoto anapumzika vya kutosha, " +
                      "anapata maji mengi, na kula vizuri. Kama dalili zinaendelea zaidi ya siku 10 " +
                      "au kama mtoto ana homa, tafuta huduma ya afya."
                    : "Coughs and colds are common in children. Ensure the child rests adequately, " +
                      "drinks plenty of fluids, and eats well. If symptoms persist beyond 10 days " +
                      "or the child develops a fever, seek medical care.");
                break;
            case "DIARRHEA":
                response.append(isSwahili
                    ? "Kuharisha kunaweza kusababisha upungufu wa maji mwilini. " +
                      "Mpe mtoto ORS (Oral Rehydration Salts) na maji mengi. " +
                      "Endelea kumlisha kama kawaida. Tafuta huduma ya afya HARAKA " +
                      "kama kuna dalili za upungufu wa maji, damu kwenye kinyesi, au homa."
                    : "Diarrhea can cause dehydration. Give the child ORS (Oral Rehydration Salts) and plenty of fluids. " +
                      "Continue feeding as usual. Seek medical care IMMEDIATELY " +
                      "if there are signs of dehydration, blood in stool, or fever.");
                break;
            default:
                response.append(isSwahili
                    ? "Asante kwa swali lako. Kwa maswali maalum ya afya, " +
                      "ninapendekeza uwasiliane na mtoa huduma wa afya aliye karibu. " +
                      "Je, kuna kitu kingine chochote ninachoweza kukusaidia nacho?"
                    : "Thank you for your question. For specific health concerns, " +
                      "I recommend contacting your nearest healthcare provider. " +
                      "Is there anything else I can help you with?");
        }

        response.append(disclaimer);
        return response.toString();
    }

    private AIConversation saveConversation(User user, AIChatRequest request, String response, String intent, String language, long startTime) {
        AIConversation convo = AIConversation.builder()
                .user(user)
                .childId(request.getChildId())
                .sessionId(request.getSessionId())
                .userMessage(request.getMessage())
                .aiResponse(response)
                .intent(intent)
                .language(language)
                .durationMs(System.currentTimeMillis() - startTime)
                .build();
        return conversationRepository.save(convo);
    }

    /**
     * Calls a real LLM (Groq or OpenAI) and returns its reply.
     * Returns null on any error — caller falls back to generateSafeResponse.
     */
    private String callRealAI(String userMessage, Long childId, String language) {
        boolean sw = "sw".equals(language);
        StringBuilder system = new StringBuilder();
        system.append(sw
                ? "Wewe ni MtotoCare AI, msaidizi wa afya ya mtoto kwa wazazi nchini Tanzania. "
                : "You are MtotoCare AI, a child-health assistant for parents in Tanzania. ");
        system.append(sw
                ? "Jibu kwa ufupi, kwa uwazi, na kwa huruma. "
                : "Answer briefly, clearly, and with empathy. ");
        system.append(sw
                ? "Tumia lugha rahisi. "
                : "Use simple language. ");
        if (childId != null) {
            Child child = childRepository.findById(childId).orElse(null);
            if (child != null) {
                Integer ageMonths = child.getAgeInMonths();
                String gender = child.getGender();
                if (sw) {
                    system.append("Mtoto wa mteja ana miezi ").append(ageMonths).append(" (");
                    system.append("M" .equals(gender) ? "mvulana" : "msichana").append("). ");
                } else {
                    system.append("The user's child is ").append(ageMonths).append(" months old (");
                    system.append("MALE".equals(gender) ? "boy" : "girl").append("). ");
                }
            }
        }
        system.append(sw
                ? "Mambo muhimu: 1) Daima onya kwa wazazi kwamba kwa dharura ya kweli wanapaswa kwenda hospitali. "
                        + "2) Usitoe dawa maalum, sindano, au vipimo. "
                        + "3) Rejelea chanjo za EPI za Tanzania, lishe bora, na umuhimu wa kumwona daktari. "
                        + "4) Usibadilishe ushauri wa daktari aliyetoa. "
                        + "5) Jibu kwa Kiswahili ikiwa mtumiaji anaandika kwa Kiswahili."
                : "Important rules: 1) Always tell parents to go to a hospital for real emergencies. "
                        + "2) Never prescribe specific medications, injections, or lab tests. "
                        + "3) Reference Tanzania's EPI vaccination schedule, good nutrition, and the importance of seeing a doctor. "
                        + "4) Don't contradict advice a doctor has already given. "
                        + "5) Reply in Kiswahili if the user wrote in Kiswahili, otherwise in English. "
                        + "6) Keep answers under 150 words. "
                        + "7) End with one short medical disclaimer sentence.");

        return aiClient.chatWithPrompts(system.toString(), userMessage);
    }
}
