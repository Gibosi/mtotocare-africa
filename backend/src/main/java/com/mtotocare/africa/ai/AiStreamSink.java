package com.mtotocare.africa.ai;

/**
 * Callback for streaming AI chat. Implemented by AIController's SSE
 * adapter; AIService calls these as the provider yields tokens.
 */
public interface AiStreamSink {
    void onChunk(String chunk);
    void onDone(AIChatMessageDto finalMessage);
    void onError(Throwable t);
}
