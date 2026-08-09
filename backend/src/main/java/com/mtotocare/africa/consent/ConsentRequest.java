package com.mtotocare.africa.consent;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class ConsentRequest {
    @NotBlank
    private String consentType;
    private String version;
    @NotNull
    private Boolean granted;
    private String notes;
}
