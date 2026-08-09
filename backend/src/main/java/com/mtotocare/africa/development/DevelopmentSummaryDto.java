package com.mtotocare.africa.development;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DevelopmentSummaryDto {
    private Long childId;
    private int totalMilestones;
    private int achievedCount;
    private int pendingCount;
    private int overdueCount;
    private int delayedCount;
    private boolean hasDelay;
    private List<DevelopmentMilestoneDto> delayedMilestones;
    private List<String> recommendedInterventions;
}
