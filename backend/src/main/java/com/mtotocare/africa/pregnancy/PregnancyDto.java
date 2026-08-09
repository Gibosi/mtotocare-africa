package com.mtotocare.africa.pregnancy;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PregnancyDto {
    private Long id;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastMenstrualPeriod;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expectedDueDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate conceptionDate;
    private Integer gravida;
    private Integer para;
    private Integer miscarriages;
    private String bloodGroup;
    private String rhFactor;
    private Double weightKgPrePregnancy;
    private Double heightCm;
    private Boolean highRisk;
    private String riskFactors;
    private String status;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate;
    private String deliveryType;
    private String deliveryOutcome;
    private String babyGender;
    private Double babyWeightKg;
    private String notes;
    private Integer currentWeek;
    private Integer trimester;
    private Long daysUntilDue;

    public static PregnancyDto from(Pregnancy p) {
        return PregnancyDto.builder()
                .id(p.getId())
                .lastMenstrualPeriod(p.getLastMenstrualPeriod())
                .expectedDueDate(p.getExpectedDueDate())
                .conceptionDate(p.getConceptionDate())
                .gravida(p.getGravida())
                .para(p.getPara())
                .miscarriages(p.getMiscarriages())
                .bloodGroup(p.getBloodGroup())
                .rhFactor(p.getRhFactor())
                .weightKgPrePregnancy(p.getWeightKgPrePregnancy())
                .heightCm(p.getHeightCm())
                .highRisk(p.getHighRisk())
                .riskFactors(p.getRiskFactors())
                .status(p.getStatus())
                .deliveryDate(p.getDeliveryDate())
                .deliveryType(p.getDeliveryType())
                .deliveryOutcome(p.getDeliveryOutcome())
                .babyGender(p.getBabyGender())
                .babyWeightKg(p.getBabyWeightKg())
                .notes(p.getNotes())
                .currentWeek(p.getCurrentWeek())
                .trimester(p.getTrimester())
                .daysUntilDue(p.getDaysUntilDue())
                .build();
    }
}
