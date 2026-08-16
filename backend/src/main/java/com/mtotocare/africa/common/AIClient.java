package com.mtotocare.africa.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.*;

/**
 * Provider-agnostic AI client. Sends a chat-completion request to the configured
 * provider (Groq, OpenAI, or mock) and returns the response text.
 *
 * Both Groq and OpenAI use the OpenAI-compatible /chat/completions API,
 * so the same request format works for both.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIClient {

    private final AIProviderProperties props;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        String provider = props.getProvider() == null ? "mock" : props.getProvider().toLowerCase();
        switch (provider) {
            case "groq":
                if (props.getApiKey() == null || props.getApiKey().isBlank()) {
                    log.warn("mtotocare.ai.provider=groq but GROQ_API_KEY is blank. Falling back to mock.");
                } else {
                    log.info("AI client: GROQ (model={})", props.getModel().isBlank() ? "openai/gpt-oss-120b" : props.getModel());
                }
                break;
            case "openai":
                if (props.getApiKey() == null || props.getApiKey().isBlank()) {
                    log.warn("mtotocare.ai.provider=openai but OPENAI_API_KEY is blank. Falling back to mock.");
                } else {
                    log.info("AI client: OpenAI (model={})", props.getModel().isBlank() ? "gpt-4o-mini" : props.getModel());
                }
                break;
            default:
                log.info("AI client: MOCK (offline safe responses, no API key needed)");
        }
    }

    /**
     * Send a chat completion request and return the assistant's reply.
     * Returns null if the provider is unavailable or fails.
     */
    public String chat(String systemPrompt, String userMessage) {
        String provider = props.getProvider() == null ? "mock" : props.getProvider().toLowerCase();
        if ("groq".equals(provider) && (props.getApiKey() == null || props.getApiKey().isBlank())) {
            return null;
        }
        if ("openai".equals(provider) && (props.getApiKey() == null || props.getApiKey().isBlank())) {
            return null;
        }
        try {
            switch (provider) {
                case "groq":
                    return call(GROQ_URL, "openai/gpt-oss-120b");
                case "openai":
                    return call(OPENAI_URL, "gpt-4o-mini");
                default:
                    return null; // mock — caller should use safe-response fallback
            }
        } catch (Exception e) {
            log.warn("AI call failed: {}", e.getMessage());
            return null;
        }
    }

    private String call(String url, String defaultModel) {
        String model = props.getModel().isBlank() ? defaultModel : props.getModel();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", model);
        payload.put("temperature", props.getTemperature());
        payload.put("max_tokens", props.getMaxTokens());
        payload.put("messages", List.of(
                Map.of("role", "system", "content", getSystemPrompt()),
                Map.of("role", "user", "content", getCachedUserPrompt())
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(props.getApiKey());
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        // The system/user prompts above are placeholders; the real ones
        // are passed in via chat(systemPrompt, userMessage) which sets them
        // into thread-local fields.
        // Actually, simpler: rebuild the payload here.
        payload.put("messages", List.of(
                Map.of("role", "system", "content", threadSystem.get()),
                Map.of("role", "user", "content", threadUser.get())
        ));
        entity = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        if (resp.getBody() == null) return null;
        Object choices = resp.getBody().get("choices");
        if (!(choices instanceof List) || ((List<?>) choices).isEmpty()) return null;
        Object first = ((List<?>) choices).get(0);
        if (!(first instanceof Map)) return null;
        Object message = ((Map<?, ?>) first).get("message");
        if (!(message instanceof Map)) return null;
        Object content = ((Map<?, ?>) message).get("content");
        return content == null ? null : content.toString().trim();
    }

    // Thread-local storage for the actual prompts (set in chat(), consumed in call())
    private final ThreadLocal<String> threadSystem = new ThreadLocal<>();
    private final ThreadLocal<String> threadUser = new ThreadLocal<>();

    public String chatWithPrompts(String systemPrompt, String userMessage) {
        threadSystem.set(systemPrompt);
        threadUser.set(userMessage);
        try {
            return chat(systemPrompt, userMessage);
        } finally {
            threadSystem.remove();
            threadUser.remove();
        }
    }

    /**
     * Streaming variant. Connects to the provider with stream=true, reads
     * SSE chunks from the response, and pushes each text delta to the
     * consumer. Returns true if at least one chunk was emitted.
     */
    public boolean streamChatWithPrompts(String systemPrompt, String userMessage,
                                         java.util.function.Consumer<String> onChunk) {
        threadSystem.set(systemPrompt);
        threadUser.set(userMessage);
        try {
            String provider = props.getProvider() == null ? "mock" : props.getProvider().toLowerCase();
            if ("groq".equals(provider) && (props.getApiKey() == null || props.getApiKey().isBlank())) return false;
            if ("openai".equals(provider) && (props.getApiKey() == null || props.getApiKey().isBlank())) return false;
            switch (provider) {
                case "groq":  return streamCall(GROQ_URL, "openai/gpt-oss-120b", onChunk);
                case "openai": return streamCall(OPENAI_URL, "gpt-4o-mini", onChunk);
                default: return false;
            }
        } catch (Exception e) {
            log.warn("AI stream call failed: {}", e.getMessage());
            return false;
        } finally {
            threadSystem.remove();
            threadUser.remove();
        }
    }

    private boolean streamCall(String url, String defaultModel, java.util.function.Consumer<String> onChunk) {
        String model = props.getModel().isBlank() ? defaultModel : props.getModel();
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("model", model);
            payload.put("temperature", props.getTemperature());
            payload.put("max_tokens", props.getMaxTokens());
            payload.put("stream", true);
            payload.put("messages", List.of(
                    Map.of("role", "system", "content", threadSystem.get()),
                    Map.of("role", "user", "content", threadUser.get())
            ));

            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + props.getApiKey());
            conn.setRequestProperty("Accept", "text/event-stream");
            conn.setDoOutput(true);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(60000);

            try (var os = conn.getOutputStream()) {
                os.write(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsBytes(payload));
            }

            int code = conn.getResponseCode();
            if (code < 200 || code >= 300) {
                log.warn("AI stream returned HTTP {}", code);
                return false;
            }

            try (var br = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream()))) {
                String line;
                int emitted = 0;
                while ((line = br.readLine()) != null) {
                    if (line.isEmpty() || !line.startsWith("data:")) continue;
                    String payload2 = line.substring(5).trim();
                    if ("[DONE]".equals(payload2)) break;
                    try {
                        com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper()
                                .readTree(payload2);
                        com.fasterxml.jackson.databind.JsonNode delta = node.path("choices").path(0).path("delta");
                        String content = delta.path("content").asText("");
                        if (!content.isEmpty()) {
                            onChunk.accept(content);
                            emitted++;
                        }
                    } catch (Exception parseErr) {
                        // ignore non-JSON keep-alive lines
                    }
                }
                return emitted > 0;
            }
        } catch (Exception e) {
            log.warn("Stream call failed: {}", e.getMessage());
            return false;
        }
    }

    private String getSystemPrompt() { return threadSystem.get(); }
    private String getCachedUserPrompt() { return threadUser.get(); }
}
