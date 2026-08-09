package com.mtotocare.africa.ai;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * The mobile-friendly shape for an AI chat message.
 * Backend entity AIConversation has userMessage/aiResponse columns,
 * but the mobile UI expects role/content. This DTO maps between them.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AIChatMessageDto {
    private Long id;
    private Long userId;
    private Long childId;
    /** "user" or "assistant" */
    private String role;
    private String content;
    private String intent;
    private String language;
    private Long durationMs;
    private LocalDateTime createdAt;

    public static AIChatMessageDto user(Long userId, String content) {
        return AIChatMessageDto.builder()
                .userId(userId)
                .role("user")
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public static AIChatMessageDto assistant(AIConversation c) {
        return AIChatMessageDto.builder()
                .id(c.getId())
                .userId(c.getUser() != null ? c.getUser().getId() : null)
                .childId(c.getChildId())
                .role("assistant")
                .content(c.getAiResponse())
                .intent(c.getIntent())
                .language(c.getLanguage())
                .durationMs(c.getDurationMs())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
