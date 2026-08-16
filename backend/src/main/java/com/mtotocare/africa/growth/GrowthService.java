package com.mtotocare.africa.growth;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.common.AIClient;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.development.DevelopmentMilestoneService;
import com.mtotocare.africa.development.DevelopmentSummaryDto;
import com.mtotocare.africa.appointment.AppointmentService;
import com.mtotocare.africa.notification.NotificationService;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.growth.who.GrowthClassifier;
import com.mtotocare.africa.growth.who.WhoGrowthStandards;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GrowthService {

    private final GrowthRepository growthRepository;
    private final ChildRepository childRepository;
    private final WhoGrowthStandards whoGrowthStandards;
    private final AIClient aiClient;
    private final DevelopmentMilestoneService developmentMilestoneService;
    private final AppointmentService appointmentService;
    private final NotificationService notificationService;
    private final com.mtotocare.africa.user.UserRepository userRepository;

    /**
     * Add a measurement and run the full WHO Child Growth Assessment against
     * it: WAZ/HAZ/WHZ/BAZ Z-scores (real WHO MGRS reference tables), WHO
     * classification, a risk level, a composite health score, a growth-trend
     * comparison against the child's previous record, emergency/referral
     * flags, and an AI-generated plain-language clinical summary.
     */
    @Transactional
    public GrowthDto addRecord(Long childIdFromPath, GrowthRequest request) {
        // Prefer childId from path, fall back to body
        Long childId = childIdFromPath != null ? childIdFromPath : request.getChildId();
        if (childId == null) {
            throw new ApiException("Child id is required", HttpStatus.BAD_REQUEST, "CHILD_ID_REQUIRED");
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));

        Double bmi = null;
        if (request.getWeightKg() != null && request.getHeightCm() != null && request.getHeightCm() > 0) {
            double heightM = request.getHeightCm() / 100.0;
            bmi = request.getWeightKg() / (heightM * heightM);
        }

        LocalDate dob = child.getDateOfBirth();
        LocalDate measurementDate = request.getMeasurementDate();
        Integer ageInDays = null;
        if (dob != null && measurementDate != null) {
            long days = ChronoUnit.DAYS.between(dob, measurementDate);
            ageInDays = (int) Math.max(0, days);
        }

        Double waz = null, haz = null, whz = null, baz = null;
        if (ageInDays != null) {
            waz = whoGrowthStandards.weightForAgeZ(child.getGender(), ageInDays, request.getWeightKg());
            haz = whoGrowthStandards.heightForAgeZ(child.getGender(), ageInDays, request.getHeightCm());
            baz = whoGrowthStandards.bmiForAgeZ(child.getGender(), ageInDays, bmi);
            whz = whoGrowthStandards.weightForLengthOrHeightZ(
                    child.getGender(), ageInDays, request.getHeightCm(), request.getWeightKg());
        }

        boolean oedema = Boolean.TRUE.equals(request.getOedema());
        boolean severeDehydration = Boolean.TRUE.equals(request.getSevereDehydration());

        String nutritionStatus = GrowthClassifier.overallNutritionStatus(waz, haz, whz, baz);
        String riskLevel = GrowthClassifier.riskLevel(waz, haz, whz, baz, oedema, severeDehydration);
        int healthScore = GrowthClassifier.healthScore(waz, haz, whz, baz, oedema, severeDehydration);

        // Fold in developmental status: a delayed milestone (motor, language,
        // cognitive, social) raises risk by one tier and always triggers a
        // referral recommendation, even if the nutrition indicators alone
        // are LOW risk — early developmental intervention matters on its
        // own, not just as a side effect of malnutrition risk.
        DevelopmentSummaryDto devSummary = null;
        try {
            devSummary = developmentMilestoneService.getSummary(childId);
        } catch (Exception e) {
            log.warn("Could not load development summary for child {}: {}", childId, e.getMessage());
        }
        boolean hasDevelopmentDelay = devSummary != null && devSummary.isHasDelay();
        if (hasDevelopmentDelay) {
            riskLevel = bumpRiskForDevelopmentDelay(riskLevel);
        }

        boolean emergencyFlag = "CRITICAL".equals(riskLevel);
        boolean referralRecommended = "CRITICAL".equals(riskLevel) || "HIGH".equals(riskLevel) || hasDevelopmentDelay;

        // Compare against the child's previous assessment (if any) for a trend.
        Optional<GrowthRecord> previous = growthRepository.findFirstByChildIdOrderByMeasurementDateDesc(childId);
        Double previousWhzOrBaz = previous.map(p -> p.getWeightForHeightZ() != null ? p.getWeightForHeightZ() : p.getBmiForAgeZ())
                .orElse(null);
        Double currentWhzOrBaz = whz != null ? whz : baz;
        String growthTrend = GrowthClassifier.growthTrend(previousWhzOrBaz, currentWhzOrBaz);

        String aiSummary = generateAiSummary(child, ageInDays, request, waz, haz, whz, baz,
                nutritionStatus, riskLevel, growthTrend, oedema, severeDehydration, devSummary);

        GrowthRecord record = GrowthRecord.builder()
                .child(child)
                .measurementDate(measurementDate)
                .ageInDays(ageInDays)
                .weightKg(request.getWeightKg())
                .heightCm(request.getHeightCm())
                .headCircumferenceCm(request.getHeadCircumferenceCm())
                .muacCm(request.getMuacCm())
                .bmi(bmi)
                .weightForAgeZ(waz)
                .heightForAgeZ(haz)
                .weightForHeightZ(whz)
                .bmiForAgeZ(baz)
                .nutritionStatus(nutritionStatus)
                .riskLevel(riskLevel)
                .healthScore(healthScore)
                .growthTrend(growthTrend)
                .referralRecommended(referralRecommended)
                .emergencyFlag(emergencyFlag)
                .oedema(oedema)
                .severeDehydration(severeDehydration)
                .aiSummary(aiSummary)
                .notes(request.getNotes())
                .recordedBy(SecurityUtils.getCurrentUserEmail())
                .build();
        GrowthDto saved = GrowthDto.from(growthRepository.save(record));

        if (referralRecommended) {
            autoScheduleFollowUp(child, riskLevel, emergencyFlag);
        }
        return saved;
    }

    /**
     * Auto-books a follow-up visit and notifies the parent when a growth
     * assessment comes back HIGH/CRITICAL risk or flags a developmental
     * delay. CRITICAL/emergency cases get a near-term follow-up (3 days);
     * HIGH risk or a developmental-delay-only referral gets 14 days.
     * Failures here are logged, not thrown — a scheduling hiccup should
     * never roll back the growth assessment itself.
     */
    private void autoScheduleFollowUp(Child child, String riskLevel, boolean emergencyFlag) {
        try {
            LocalDateTime when = LocalDateTime.now().plusDays(emergencyFlag ? 3 : 14);
            String reason = "Follow-up recommended by WHO growth assessment (" + riskLevel + " risk)";
            var appointment = appointmentService.scheduleFollowUp(child, when, "FOLLOW_UP", reason);
            if (child.getParent() != null) {
                notificationService.createAppointmentReminder(
                        child.getParent().getId(),
                        "Follow-up visit recommended",
                        reason + " for " + child.getFullName() + ". A follow-up has been scheduled for "
                                + when.toLocalDate() + " — you can reschedule it if needed.",
                        appointment.getId());
            }
        } catch (Exception e) {
            log.warn("Could not auto-schedule follow-up for child {}: {}", child.getId(), e.getMessage());
        }
    }

    private String bumpRiskForDevelopmentDelay(String riskLevel) {
        if (riskLevel == null) return "MODERATE";
        switch (riskLevel) {
            case "LOW": return "MODERATE";
            case "MODERATE": return "HIGH";
            default: return riskLevel; // HIGH and CRITICAL stay as-is (already at/near the top)
        }
    }

    @Transactional(readOnly = true)
    public List<GrowthDto> getForChild(Long childId) {
        verifyAccess(childId);
        return growthRepository.findByChildIdOrderByMeasurementDateDesc(childId)
                .stream().map(GrowthDto::from).collect(Collectors.toList());
    }

    private void verifyAccess(Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        com.mtotocare.africa.user.User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        boolean isOwner = child.getParent() != null && child.getParent().getId().equals(user.getId());
        boolean isStaff = user.isHealthcareProvider() || SecurityUtils.hasAnyRole("ADMIN");
        if (!isOwner && !isStaff) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
    }

    @Transactional(readOnly = true)
    public GrowthDto getLatest(Long childId) {
        return growthRepository.findFirstByChildIdOrderByMeasurementDateDesc(childId)
                .map(GrowthDto::from)
                .orElseThrow(() -> new ApiException("No growth records", HttpStatus.NOT_FOUND, "NO_RECORDS"));
    }

    /**
     * Ask the configured LLM for a short, plain-language clinical summary and
     * explanation of the assessment (WHO's "Explainable AI" requirement) —
     * what the numbers mean and why the classification/risk level came out
     * the way it did. Falls back to a templated summary built from the same
     * classification data if no AI provider is configured or the call fails,
     * so the field is never blank.
     */
    private String generateAiSummary(Child child, Integer ageInDays, GrowthRequest request,
                                      Double waz, Double haz, Double whz, Double baz,
                                      String nutritionStatus, String riskLevel, String growthTrend,
                                      boolean oedema, boolean severeDehydration, DevelopmentSummaryDto devSummary) {
        try {
            StringBuilder system = new StringBuilder();
            system.append("You are a pediatric growth-assessment assistant for MtotoCare, a child-health app used in Tanzania. ");
            system.append("Given WHO Child Growth Standards Z-scores for a child, write a short (2-4 sentence) plain-language ");
            system.append("summary for a parent or community health worker: what the numbers mean, why the classification and ");
            system.append("risk level were reached, and one practical next step. Do not invent numbers not given to you. ");
            system.append("Never prescribe medication. If risk is HIGH or CRITICAL, clearly recommend seeing a health worker soon. ");
            system.append("If a developmental delay is mentioned, briefly note it and the recommended next step for that too.");

            StringBuilder user = new StringBuilder();
            user.append("Child age: ").append(ageInDays != null ? (ageInDays / 30) + " months" : "unknown").append(". ");
            user.append("Weight-for-age Z-score (WAZ): ").append(fmt(waz)).append(". ");
            user.append("Height-for-age Z-score (HAZ): ").append(fmt(haz)).append(". ");
            user.append("Weight-for-height Z-score (WHZ): ").append(fmt(whz)).append(". ");
            user.append("BMI-for-age Z-score (BAZ): ").append(fmt(baz)).append(". ");
            user.append("Overall classification: ").append(nutritionStatus).append(". ");
            user.append("Risk level: ").append(riskLevel).append(". ");
            user.append("Growth trend vs last visit: ").append(growthTrend).append(". ");
            if (oedema) user.append("Oedema present. ");
            if (severeDehydration) user.append("Signs of severe dehydration present. ");
            if (devSummary != null && devSummary.isHasDelay()) {
                user.append("Developmental delay flagged in: ")
                        .append(devSummary.getDelayedMilestones().stream()
                                .map(m -> m.getCategory() + " (" + m.getTitle() + ")")
                                .distinct().collect(Collectors.joining(", ")))
                        .append(". ");
            }

            String ai = aiClient.chatWithPrompts(system.toString(), user.toString());
            if (ai != null && !ai.isBlank()) {
                return ai.trim();
            }
        } catch (Exception e) {
            log.warn("AI growth summary generation failed, using templated summary: {}", e.getMessage());
        }
        return templatedSummary(nutritionStatus, riskLevel, growthTrend, oedema, severeDehydration, devSummary);
    }

    private String fmt(Double z) {
        return z == null ? "not available" : String.format("%.2f", z);
    }

    private String templatedSummary(String nutritionStatus, String riskLevel, String growthTrend,
                                     boolean oedema, boolean severeDehydration, DevelopmentSummaryDto devSummary) {
        StringBuilder sb = new StringBuilder();
        sb.append("This assessment classifies the child as ")
                .append(nutritionStatus.replace('_', ' ').toLowerCase())
                .append(", with a ").append(riskLevel.toLowerCase()).append(" risk level. ");
        if ("FALTERING".equals(growthTrend)) {
            sb.append("Growth has declined since the last visit — closer monitoring is recommended. ");
        } else if ("IMPROVING".equals(growthTrend)) {
            sb.append("Growth has improved since the last visit. ");
        }
        if (oedema || severeDehydration) {
            sb.append("Danger signs were reported — this child needs urgent medical attention. ");
        } else if ("HIGH".equals(riskLevel) || "CRITICAL".equals(riskLevel)) {
            sb.append("A follow-up with a healthcare provider is recommended soon. ");
        } else {
            sb.append("Continue routine growth monitoring at scheduled visits. ");
        }
        if (devSummary != null && devSummary.isHasDelay()) {
            sb.append("A developmental delay was also flagged (")
                    .append(devSummary.getDelayedCount()).append(" milestone")
                    .append(devSummary.getDelayedCount() == 1 ? "" : "s")
                    .append(") — a developmental assessment/referral is recommended. ");
        }
        return sb.toString();
    }
}
