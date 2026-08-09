package com.mtotocare.africa.ai;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class AIChatRequest {
    @NotBlank
    @Size(max = 2000)
    private String message;

    private Long childId;
    private String sessionId;
    private String language;
}
