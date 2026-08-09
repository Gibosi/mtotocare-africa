package com.mtotocare.africa.development;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DevelopmentMilestoneService {

    /** Months past the expected age before a not-yet-achieved milestone is auto-flagged as delayed. */
    private static final int DELAY_GRACE_MONTHS = 2;

    private static final Map<String, String> INTERVENTIONS = Map.of(
        "GROSS_MOTOR", "Refer for a physiotherapy/motor-development assessment. Encourage tummy time, supported standing, and floor play to build strength.",
        "FINE_MOTOR", "Encourage grasping, stacking, and self-feeding practice. Refer to occupational therapy if delay persists past the next check.",
        "LANGUAGE", "Screen hearing if not already done. Encourage talking, naming objects, and reading aloud daily. Refer to a speech-language therapist if delay persists.",
        "COGNITIVE", "Refer for a developmental assessment. Encourage cause-and-effect play (stacking, sorting, simple puzzles) and responsive caregiving.",
        "SOCIAL", "Encourage supervised play with other children and consistent, warm caregiver interaction. Refer for a developmental assessment if delay is marked.",
        "EMOTIONAL", "Provide consistent, responsive caregiving. Refer for a developmental/behavioral assessment if delay is marked or is accompanied by other concerns."
    );

    private final DevelopmentMilestoneRepository repository;
    private final ChildRepository childRepository;

    @Transactional
    public List<DevelopmentMilestoneDto> generateForChild(Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        verifyOwnership(child);

        List<DevelopmentMilestone> existing = repository.findByChildIdAndDeletedAtIsNullOrderByExpectedDateAsc(childId);
        if (!existing.isEmpty()) {
            return applyAutoDelayDetection(existing).stream().map(this::toDto).collect(Collectors.toList());
        }

        List<DevelopmentMilestone> toCreate = new ArrayList<>();
        for (MilestoneCatalog.Milestone m : MilestoneCatalog.CATALOG) {
            LocalDate expectedDate = child.getDateOfBirth().plusMonths(m.ageMonths);
            toCreate.add(DevelopmentMilestone.builder()
                    .child(child)
                    .milestoneCode(m.code)
                    .category(m.category)
                    .title(m.title)
                    .description(m.description)
                    .expectedAgeMonths(m.ageMonths)
                    .expectedDate(expectedDate)
                    .status(expectedDate.isBefore(LocalDate.now()) ? "OVERDUE" : "PENDING")
                    .build());
        }
        repository.saveAll(toCreate);
        log.info("Generated {} milestones for child: {}", toCreate.size(), childId);
        return applyAutoDelayDetection(toCreate).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public List<DevelopmentMilestoneDto> getForChild(Long childId) {
        verifyOwnership(childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND")));
        List<DevelopmentMilestone> milestones = repository.findByChildIdAndDeletedAtIsNullOrderByExpectedDateAsc(childId);
        return applyAutoDelayDetection(milestones).stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Aggregate developmental status for a child — used by the milestones
     * screen and folded into the WHO growth assessment's AI summary/risk
     * stratification so a delayed milestone can influence risk the same
     * way a low Z-score does.
     */
    @Transactional
    public DevelopmentSummaryDto getSummary(Long childId) {
        List<DevelopmentMilestoneDto> milestones = getForChild(childId);
        Map<String, Long> byStatus = milestones.stream()
                .collect(Collectors.groupingBy(DevelopmentMilestoneDto::getStatus, Collectors.counting()));
        List<DevelopmentMilestoneDto> delayed = milestones.stream()
                .filter(m -> "DELAYED".equals(m.getStatus()) || "NOT_ACHIEVED".equals(m.getStatus()))
                .collect(Collectors.toList());
        List<String> interventions = delayed.stream()
                .map(DevelopmentMilestoneDto::getRecommendedIntervention)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        return DevelopmentSummaryDto.builder()
                .childId(childId)
                .totalMilestones(milestones.size())
                .achievedCount(byStatus.getOrDefault("ACHIEVED", 0L).intValue())
                .pendingCount(byStatus.getOrDefault("PENDING", 0L).intValue())
                .overdueCount(byStatus.getOrDefault("OVERDUE", 0L).intValue())
                .delayedCount(delayed.size())
                .delayedMilestones(delayed)
                .recommendedInterventions(interventions)
                .hasDelay(!delayed.isEmpty())
                .build();
    }

    @Transactional
    public DevelopmentMilestoneDto markAchieved(Long milestoneId, LocalDate achievedDate, String notes) {
        DevelopmentMilestone m = repository.findById(milestoneId)
                .orElseThrow(() -> new ApiException("Milestone not found", HttpStatus.NOT_FOUND, "MILESTONE_NOT_FOUND"));
        verifyOwnership(m.getChild());
        m.setStatus("ACHIEVED");
        m.setAchievedDate(achievedDate != null ? achievedDate : LocalDate.now());
        m.setNotes(notes);
        return toDto(repository.save(m));
    }

    @Transactional
    public DevelopmentMilestoneDto markDelayed(Long milestoneId, String notes) {
        DevelopmentMilestone m = repository.findById(milestoneId)
                .orElseThrow(() -> new ApiException("Milestone not found", HttpStatus.NOT_FOUND, "MILESTONE_NOT_FOUND"));
        verifyOwnership(m.getChild());
        m.setStatus("DELAYED");
        m.setNotes(notes);
        return toDto(repository.save(m));
    }

    /**
     * Any milestone still PENDING more than DELAY_GRACE_MONTHS past its
     * expected age gets auto-flagged as DELAYED (persisted) rather than
     * silently sitting as PENDING/OVERDUE forever — this is the
     * "detect developmental delays" behavior; a clinician can still review
     * and correct it via markAchieved/markDelayed.
     */
    private List<DevelopmentMilestone> applyAutoDelayDetection(List<DevelopmentMilestone> milestones) {
        LocalDate today = LocalDate.now();
        List<DevelopmentMilestone> toSave = new ArrayList<>();
        for (DevelopmentMilestone m : milestones) {
            boolean stillOpen = "PENDING".equals(m.getStatus()) || "OVERDUE".equals(m.getStatus());
            if (stillOpen && m.getExpectedDate() != null
                    && m.getExpectedDate().plusMonths(DELAY_GRACE_MONTHS).isBefore(today)) {
                m.setStatus("DELAYED");
                toSave.add(m);
            }
        }
        if (!toSave.isEmpty()) {
            repository.saveAll(toSave);
        }
        return milestones;
    }

    private DevelopmentMilestoneDto toDto(DevelopmentMilestone m) {
        DevelopmentMilestoneDto dto = DevelopmentMilestoneDto.from(m);
        if ("DELAYED".equals(m.getStatus()) || "NOT_ACHIEVED".equals(m.getStatus())) {
            dto.setRecommendedIntervention(INTERVENTIONS.get(m.getCategory()));
        }
        return dto;
    }

    private void verifyOwnership(Child child) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (child.getParent().getEmail().equals(email)) return;
        // Clinical staff can view/manage any child's milestones — not just the
        // owning parent — same access model as vaccinations and growth records.
        if (SecurityUtils.hasAnyRole("DOCTOR", "NURSE", "MIDWIFE", "CHW", "ADMIN")) return;
        throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
    }
}
