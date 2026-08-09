package com.mtotocare.africa.development;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DevelopmentMilestoneDto {
    private Long id;
    private Long childId;
    private String category;
    private String milestoneCode;
    private String title;
    private String description;
    private Integer expectedAgeMonths;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expectedDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate achievedDate;
    private String status;
    private String notes;
    private String photoUrl;
    private String recommendedIntervention;

    public static DevelopmentMilestoneDto from(DevelopmentMilestone m) {
        return DevelopmentMilestoneDto.builder()
                .id(m.getId())
                .childId(m.getChild() != null ? m.getChild().getId() : null)
                .category(m.getCategory())
                .milestoneCode(m.getMilestoneCode())
                .title(m.getTitle())
                .description(m.getDescription())
                .expectedAgeMonths(m.getExpectedAgeMonths())
                .expectedDate(m.getExpectedDate())
                .achievedDate(m.getAchievedDate())
                .status(m.getStatus())
                .notes(m.getNotes())
                .photoUrl(m.getPhotoUrl())
                .build();
    }
}
