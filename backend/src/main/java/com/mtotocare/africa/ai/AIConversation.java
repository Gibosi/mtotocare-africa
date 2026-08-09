package com.mtotocare.africa.ai;

import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "ai_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIConversation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "child_id")
    private Long childId;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "user_message", nullable = false, length = 3000)
    private String userMessage;

    @Column(name = "ai_response", nullable = false, length = 3000)
    private String aiResponse;

    @Column(name = "intent", length = 100)
    private String intent;

    @Column(name = "language", length = 5)
    @Builder.Default
    private String language = "en";

    @Column(name = "duration_ms")
    private Long durationMs;
}
