package com.mtotocare.africa.analytics;

import com.mtotocare.africa.appointment.Appointment;
import com.mtotocare.africa.appointment.AppointmentRepository;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.growth.GrowthRepository;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import com.mtotocare.africa.vaccination.Vaccination;
import com.mtotocare.africa.vaccination.VaccinationRepository;
import com.mtotocare.africa.vaccination.VaccinationSchedule;
import com.mtotocare.africa.vaccination.VaccinationScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ChildRepository childRepository;
    private final VaccinationRepository vaccinationRepository;
    private final VaccinationScheduleRepository scheduleRepository;
    private final GrowthRepository growthRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getChildSummary(Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        verifyOwnership(child);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("childId", child.getId());
        summary.put("childName", child.getFullName());
        summary.put("ageMonths", child.getAgeInMonths());
        summary.put("ageYears", child.getAgeInYears());
        summary.put("gender", child.getGender());
        summary.put("bloodGroup", child.getBloodGroup());

        // Vaccination stats
        List<Vaccination> vaccinations = vaccinationRepository.findAll().stream()
                .filter(v -> v.getChild() != null && v.getChild().getId().equals(childId))
                .collect(Collectors.toList());
        long totalVax = vaccinations.size();
        long administeredVax = vaccinations.stream().filter(v -> "ADMINISTERED".equals(v.getStatus())).count();
        long overdueVax = vaccinations.stream().filter(Vaccination::isOverdue).count();

        Map<String, Object> vaxStats = new LinkedHashMap<>();
        vaxStats.put("totalScheduled", totalVax);
        vaxStats.put("administered", administeredVax);
        vaxStats.put("pending", totalVax - administeredVax);
        vaxStats.put("overdue", overdueVax);
        vaxStats.put("completionRate", totalVax > 0 ? Math.round((administeredVax * 100.0 / totalVax) * 10) / 10.0 : 0.0);
        summary.put("vaccinations", vaxStats);

        // Growth stats
        long growthRecords = growthRepository.findAll().stream()
                .filter(g -> g.getChild() != null && g.getChild().getId().equals(childId))
                .count();
        Map<String, Object> growthStats = new LinkedHashMap<>();
        growthStats.put("totalRecords", growthRecords);
        growthStats.put("lastCheckDate", growthRepository.findAll().stream()
                .filter(g -> g.getChild() != null && g.getChild().getId().equals(childId))
                .map(g -> g.getMeasurementDate())
                .max(LocalDate::compareTo).orElse(null));
        summary.put("growth", growthStats);

        // Appointment stats
        long appointmentCount = appointmentRepository.findAll().stream()
                .filter(a -> a.getChild() != null && a.getChild().getId().equals(childId))
                .count();
        Map<String, Object> appointmentStats = new LinkedHashMap<>();
        appointmentStats.put("total", appointmentCount);
        appointmentStats.put("upcoming", appointmentRepository.findAll().stream()
                .filter(a -> a.getChild() != null && a.getChild().getId().equals(childId))
                .filter(a -> a.getAppointmentDatetime().isAfter(java.time.LocalDateTime.now()))
                .filter(a -> "SCHEDULED".equals(a.getStatus()))
                .count());
        summary.put("appointments", appointmentStats);

        return summary;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard() {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));

        List<Child> myChildren = childRepository.findByParentIdAndDeletedAtIsNull(user.getId());

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("totalChildren", myChildren.size());
        dashboard.put("activePregnancies", 0); // would query pregnancyRepository
        dashboard.put("upcomingAppointments", appointmentRepository.findAll().stream()
                .filter(a -> a.getChild() != null && a.getChild().getParent().getId().equals(user.getId()))
                .filter(a -> a.getAppointmentDatetime().isAfter(java.time.LocalDateTime.now()))
                .filter(a -> "SCHEDULED".equals(a.getStatus()))
                .count());
        dashboard.put("overdueVaccinations", vaccinationRepository.findAll().stream()
                .filter(Vaccination::isOverdue)
                .filter(v -> v.getChild() != null && v.getChild().getParent().getId().equals(user.getId()))
                .count());
        dashboard.put("pendingGrowthChecks", myChildren.stream()
                .filter(c -> {
                    var latestGrowth = growthRepository.findAll().stream()
                            .filter(g -> g.getChild() != null && g.getChild().getId().equals(c.getId()))
                            .max(Comparator.comparing(g -> g.getMeasurementDate()));
                    return latestGrowth.isEmpty() || latestGrowth.get().getMeasurementDate()
                            .isBefore(LocalDate.now().minusMonths(3));
                })
                .count());
        return dashboard;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getVaccinationCoverageReport() {
        List<VaccinationSchedule> schedules = scheduleRepository.findAll();
        return schedules.stream().map(s -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("vaccineCode", s.getVaccineCode());
            row.put("vaccineName", s.getVaccineName());
            long administered = vaccinationRepository.findAll().stream()
                    .filter(v -> v.getVaccineCode() != null && v.getVaccineCode().equals(s.getVaccineCode()))
                    .filter(v -> "ADMINISTERED".equals(v.getStatus()))
                    .count();
            row.put("administeredCount", administered);
            return row;
        }).collect(Collectors.toList());
    }

    /**
     * Provider-facing panel: nutrition status distribution, vaccination
     * coverage, growth trend, and a high-risk children list across the
     * clinician's patient panel (all children — clinical staff aren't
     * scoped to a single parent's children the way the parent dashboard is).
     * Backs the "dashboards for healthcare providers" requirement.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getProviderDashboard() {
        List<Child> children = childRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .collect(Collectors.toList());

        // Latest growth record per child — group by child, keep the newest.
        Map<Long, com.mtotocare.africa.growth.GrowthRecord> latestGrowthByChild = growthRepository.findAll().stream()
                .filter(g -> g.getChild() != null && g.getMeasurementDate() != null)
                .collect(Collectors.toMap(
                        g -> g.getChild().getId(),
                        g -> g,
                        (a, b) -> a.getMeasurementDate().isAfter(b.getMeasurementDate()) ? a : b));

        Map<String, Long> nutritionStatusCounts = latestGrowthByChild.values().stream()
                .map(com.mtotocare.africa.growth.GrowthRecord::getNutritionStatus)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        Map<String, Long> riskLevelCounts = latestGrowthByChild.values().stream()
                .map(com.mtotocare.africa.growth.GrowthRecord::getRiskLevel)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        List<Map<String, Object>> highRiskChildren = latestGrowthByChild.values().stream()
                .filter(g -> "HIGH".equals(g.getRiskLevel()) || "CRITICAL".equals(g.getRiskLevel()))
                .sorted(Comparator.comparing((com.mtotocare.africa.growth.GrowthRecord g) -> "CRITICAL".equals(g.getRiskLevel()) ? 0 : 1)
                        .thenComparing(com.mtotocare.africa.growth.GrowthRecord::getMeasurementDate, Comparator.reverseOrder()))
                .map(g -> {
                    Child c = g.getChild();
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("childId", c.getId());
                    row.put("childName", c.getFullName());
                    row.put("ageMonths", c.getAgeInMonths());
                    row.put("riskLevel", g.getRiskLevel());
                    row.put("nutritionStatus", g.getNutritionStatus());
                    row.put("healthScore", g.getHealthScore());
                    row.put("growthTrend", g.getGrowthTrend());
                    row.put("emergencyFlag", g.getEmergencyFlag());
                    row.put("lastAssessedDate", g.getMeasurementDate());
                    return row;
                })
                .collect(Collectors.toList());

        long overdueVax = vaccinationRepository.findAll().stream().filter(Vaccination::isOverdue).count();
        long totalVax = vaccinationRepository.count();
        long administeredVax = vaccinationRepository.findAll().stream()
                .filter(v -> "ADMINISTERED".equals(v.getStatus())).count();

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("totalChildren", children.size());
        dashboard.put("assessedChildren", latestGrowthByChild.size());
        dashboard.put("nutritionStatusCounts", nutritionStatusCounts);
        dashboard.put("riskLevelCounts", riskLevelCounts);
        dashboard.put("highRiskChildren", highRiskChildren);
        Map<String, Object> vaxCoverage = new LinkedHashMap<>();
        vaxCoverage.put("total", totalVax);
        vaxCoverage.put("administered", administeredVax);
        vaxCoverage.put("overdue", overdueVax);
        vaxCoverage.put("coverageRate", totalVax > 0 ? Math.round((administeredVax * 100.0 / totalVax) * 10) / 10.0 : 0.0);
        dashboard.put("vaccinationCoverage", vaxCoverage);
        return dashboard;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPopulationStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalChildren", childRepository.count());
        stats.put("totalVaccinations", vaccinationRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());

        // Children by gender
        Map<String, Long> byGender = childRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .collect(Collectors.groupingBy(Child::getGender, Collectors.counting()));
        stats.put("childrenByGender", byGender);

        // Children by age band
        Map<String, Long> byAgeBand = childRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .filter(c -> c.getAgeInMonths() != null)
                .collect(Collectors.groupingBy(c -> {
                    int m = c.getAgeInMonths();
                    if (m < 12) return "0-12 months";
                    if (m < 24) return "1-2 years";
                    if (m < 60) return "2-5 years";
                    return "5+ years";
                }, Collectors.counting()));
        stats.put("childrenByAgeBand", byAgeBand);

        // Malnutrition prevalence — the standard WHO/UNICEF public-health
        // indicators (stunting/wasting/underweight/overweight prevalence),
        // computed from each child's most recent WHO growth assessment.
        // Anonymized: only aggregate counts/percentages leave this method,
        // no child-identifying fields.
        Map<Long, com.mtotocare.africa.growth.GrowthRecord> latestGrowthByChild = growthRepository.findAll().stream()
                .filter(g -> g.getChild() != null && g.getMeasurementDate() != null)
                .collect(Collectors.toMap(
                        g -> g.getChild().getId(),
                        g -> g,
                        (a, b) -> a.getMeasurementDate().isAfter(b.getMeasurementDate()) ? a : b));
        long assessed = latestGrowthByChild.size();
        Map<String, Object> prevalence = new LinkedHashMap<>();
        prevalence.put("childrenAssessed", assessed);
        for (String status : List.of("SEVERELY_STUNTED", "STUNTED", "SEVERELY_WASTED", "WASTED",
                "SEVERELY_UNDERWEIGHT", "UNDERWEIGHT", "OVERWEIGHT", "OBESE", "NORMAL")) {
            long count = latestGrowthByChild.values().stream()
                    .filter(g -> status.equals(g.getNutritionStatus()))
                    .count();
            double pct = assessed > 0 ? Math.round((count * 100.0 / assessed) * 10) / 10.0 : 0.0;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("count", count);
            row.put("percentage", pct);
            prevalence.put(status.toLowerCase(), row);
        }
        stats.put("malnutritionPrevalence", prevalence);

        return stats;
    }

    private void verifyOwnership(Child child) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (!child.getParent().getEmail().equals(email)) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
    }
}
