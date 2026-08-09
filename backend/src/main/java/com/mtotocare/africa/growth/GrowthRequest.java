package com.mtotocare.africa.growth;

import lombok.Data;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class GrowthRequest {
    /**
     * Optional — childId is normally passed in the URL path.
     * If present in the body, it overrides the path.
     */
    private Long childId;

    @NotNull
    private LocalDate measurementDate;

    private Double weightKg;
    private Double heightCm;
    private Double headCircumferenceCm;
    private Double muacCm;
    private String notes;

    /** Clinician-reported danger signs — feed WHO emergency detection and risk stratification. */
    private Boolean oedema;
    private Boolean severeDehydration;
}
