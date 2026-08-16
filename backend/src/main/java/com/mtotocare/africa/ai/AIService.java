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
        String response = callRealAI(context.toString(), request.getChildId(), language, intent);
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
                    buildSystemPrompt(language, child, intent), context.toString(), chunkConsumer);

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

    private String buildSystemPrompt(String language, Child child, String intent) {
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
        String knowledge = ChildHealthKnowledgeBase.get(intent, language);
        if (knowledge != null) {
            system.append(sw
                    ? "Maelezo ya rejea kwa mada hii (tumia kama msingi, si lazima kunukuu neno kwa neno): "
                    : "Reference facts for this topic (use to ground your answer — no need to quote verbatim): ");
            system.append(knowledge).append(" ");
        }
        system.append(sw
                ? "MUHIMU: Jibu swali hasa alilouliza mtumiaji, si muhtasari wa jumla. Kama ni salamu tu, mkaribishe kwa ufupi."
                : "IMPORTANT: Answer the specific question asked, not a generic overview. If it's just a greeting, " +
                  "greet back briefly and ask what you can help with.");
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
        if (containsAny(lower, "vaccin", "immuniz", "chanjo")) return "VACCINATION";
        if (containsAny(lower, "malnutri", "wasting", "stunt", "oedema", "edema", "kudhoofika", "kudumaa", "utapiamlo")) return "MALNUTRITION";
        if (containsAny(lower, "breastfe", "breast milk", "nyonyesha", "maziwa ya mama")) return "BREASTFEEDING";
        if (containsAny(lower, "food", "eat", "nutrition", "feed", "meal", "chakula", "lishe", "kulisha")) return "NUTRITION";
        if (containsAny(lower, "fever", "temperature", "hot body", "homa", "joto la mwili")) return "FEVER";
        if (containsAny(lower, "diarr", "loose stool", "kuharisha", "kuhara")) return "DIARRHEA";
        if (containsAny(lower, "cough", "cold", "flu", "kikohozi", "mafua")) return "COUGH_COLD";
        if (containsAny(lower, "rash", "skin", "itch", "vipele", "ngozi")) return "SKIN_RASH";
        if (containsAny(lower, "sleep", "nap", "usingizi", "kulala")) return "SLEEP";
        if (containsAny(lower, "cut", "burn", "injur", "wound", "bleed", "kuungua", "jeraha", "kukatika")) return "INJURY_FIRST_AID";
        if (containsAny(lower, "wash hand", "hygien", "clean", "kunawa", "usafi")) return "HYGIENE";
        if (containsAny(lower, "milestone", "development", "talk", "walk", "crawl", "sit up", "ukuaji wa akili", "hatua za ukuaji")) return "DEVELOPMENT";
        if (containsAny(lower, "growth", "weight", "height", "muac", "ukuaji", "uzito", "urefu")) return "GROWTH";
        if (containsAny(lower, "pregnan", "anc", "antenatal", "mimba", "expecting", "ujauzito")) return "PREGNANCY";
        return "GENERAL";
    }

    private boolean containsAny(String haystack, String... needles) {
        for (String n : needles) {
            if (haystack.contains(n)) return true;
        }
        return false;
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

        String knowledge = ChildHealthKnowledgeBase.get(intent, language);
        if (knowledge != null) {
            response.append(knowledge);
        } else {
            // GENERAL — the question didn't match a known topic. Rather than a
            // dead-end non-answer, point at what this assistant can actually
            // help with, so the person gets somewhere useful next.
            response.append(isSwahili
                ? "Naweza kukusaidia na maswali kuhusu: chanjo, lishe, homa, kuharisha, kikohozi/mafua, " +
                  "ukuaji wa mtoto, unyonyeshaji, usingizi, vipele vya ngozi, huduma ya kwanza, usafi, " +
                  "hatua za ukuaji, ujauzito, au utapiamlo. Jaribu kuuliza swali lako kwa njia hiyo, " +
                  "kwa mfano \"mtoto wangu ana homa, nifanye nini?\""
                : "I can help with questions about: vaccinations, nutrition, fever, diarrhea, cough/cold, " +
                  "growth, breastfeeding, sleep, skin rashes, first aid, hygiene, developmental milestones, " +
                  "pregnancy, or malnutrition. Try asking about one of those directly — " +
                  "for example \"my child has a fever, what should I do?\"");
        }

        response.append(disclaimer);
        return response.toString();
    }

    /**
     * Calls a real LLM (Groq or OpenAI) and returns its reply.
     * Returns null on any error — caller falls back to generateSafeResponse.
     */
    private String callRealAI(String userMessage, Long childId, String language, String intent) {
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
                    system.append("MALE".equals(gender) ? "mvulana" : "msichana").append("). ");
                } else {
                    system.append("The user's child is ").append(ageMonths).append(" months old (");
                    system.append("MALE".equals(gender) ? "boy" : "girl").append("). ");
                }
            }
        }

        // Ground the model in the specific, WHO/Tanzania-aligned facts for the
        // detected topic — this is what keeps answers specific to the actual
        // question instead of generic. The model can still go beyond this
        // excerpt, but it now has accurate local reference facts to anchor to.
        String knowledge = ChildHealthKnowledgeBase.get(intent, language);
        if (knowledge != null) {
            system.append(sw
                    ? "Maelezo ya rejea kwa mada hii (tumia kama msingi wa jibu lako, si lazima kuyanukuu neno kwa neno): "
                    : "Reference facts for this topic (use these to ground your answer — no need to quote verbatim): ");
            system.append(knowledge).append(" ");
        }

        system.append(sw
                ? "Mambo muhimu: 1) Daima onya kwa wazazi kwamba kwa dharura ya kweli wanapaswa kwenda hospitali. "
                        + "2) Usitoe dawa maalum, sindano, au vipimo. "
                        + "3) Rejelea chanjo za EPI za Tanzania, lishe bora, na umuhimu wa kumwona daktari. "
                        + "4) Usibadilishe ushauri wa daktari aliyetoa. "
                        + "5) Jibu kwa Kiswahili ikiwa mtumiaji anaandika kwa Kiswahili. "
                        + "6) MUHIMU: Jibu swali hasa alilouliza mtumiaji — usitoe muhtasari wa jumla kama ameuliza kitu maalum. "
                        + "Kama ni salamu tu (mfano \"Hujambo\"), mkaribishe kwa ufupi na muulize unachoweza kumsaidia."
                : "Important rules: 1) Always tell parents to go to a hospital for real emergencies. "
                        + "2) Never prescribe specific medications, injections, or lab tests. "
                        + "3) Reference Tanzania's EPI vaccination schedule, good nutrition, and the importance of seeing a doctor. "
                        + "4) Don't contradict advice a doctor has already given. "
                        + "5) Reply in Kiswahili if the user wrote in Kiswahili, otherwise in English. "
                        + "6) Keep answers under 150 words. "
                        + "7) End with one short medical disclaimer sentence. "
                        + "8) IMPORTANT: Answer the specific question the user actually asked — don't give a generic " +
                          "overview if they asked something specific. If the message is just a greeting (e.g. \"Hello\"), " +
                          "greet them back briefly and ask what you can help with — don't launch into unrelated child-health advice.");

        return aiClient.chatWithPrompts(system.toString(), userMessage);
    }
}
