package com.mtotocare.africa.ai;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final ExecutorService streamPool = Executors.newCachedThreadPool();

    @PostMapping("/chat")
    public ApiResponse<AIChatMessageDto> chat(@RequestBody AIChatRequest request) {
        return ApiResponse.success(aiService.chat(request));
    }

    /**
     * Server-Sent Events streaming endpoint. The client connects with
     * fetch() + ReadableStream (web) or expo's EventSource polyfill
     * (mobile) and receives text chunks as the AI generates them.
     * Falls back to the mock offline response if the AI provider is
     * unavailable.
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestBody AIChatRequest request) {
        SseEmitter emitter = new SseEmitter(60_000L);
        streamPool.submit(() -> {
            try {
                aiService.streamChat(request, new AiStreamSink() {
                    @Override
                    public void onChunk(String chunk) {
                        try {
                            emitter.send(SseEmitter.event().name("chunk").data(chunk));
                        } catch (IOException ignore) {}
                    }

                    @Override
                    public void onDone(AIChatMessageDto finalMessage) {
                        try {
                            emitter.send(SseEmitter.event().name("done").data(finalMessage));
                            emitter.complete();
                        } catch (IOException ignore) {}
                    }

                    @Override
                    public void onError(Throwable t) {
                        try {
                            emitter.send(SseEmitter.event().name("error").data(t.getMessage()));
                            emitter.completeWithError(t);
                        } catch (IOException ignore) {}
                    }
                });
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }

    @GetMapping("/conversations")
    public ApiResponse<List<AIChatMessageDto>> getConversations() {
        return ApiResponse.success(aiService.getHistory());
    }

    @GetMapping("/history")
    public ApiResponse<List<AIChatMessageDto>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(aiService.getHistory());
    }

    @DeleteMapping("/history")
    public ApiResponse<String> clearHistory() {
        aiService.clearHistory();
        return ApiResponse.success("AI history cleared", null);
    }

    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("AI service is running", "OK");
    }
}
