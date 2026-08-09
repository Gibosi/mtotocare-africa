package com.mtotocare.africa.anc;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.pregnancy.Pregnancy;
import com.mtotocare.africa.pregnancy.PregnancyRepository;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AncVisitService {

    private final AncVisitRepository ancVisitRepository;
    private final PregnancyRepository pregnancyRepository;
    private final UserRepository userRepository;

    @Transactional
    public AncVisitDto recordVisit(Long pregnancyId, AncVisitRequest request) {
        Pregnancy pregnancy = pregnancyRepository.findById(pregnancyId)
                .orElseThrow(() -> new ApiException("Pregnancy not found", HttpStatus.NOT_FOUND, "PREGNANCY_NOT_FOUND"));
        verifyOwnership(pregnancy);

        if (!"ANC".equals(request.getVisitType()) && !"PNC".equals(request.getVisitType())) {
            throw new ApiException("Visit type must be ANC or PNC", HttpStatus.BAD_REQUEST, "INVALID_VISIT_TYPE");
        }

        AncVisit visit = AncVisit.builder()
                .pregnancy(pregnancy)
                .visitType(request.getVisitType())
                .visitNumber(request.getVisitNumber())
                .visitDate(request.getVisitDate())
                .nextVisitDate(request.getNextVisitDate())
                .gestationalWeeks(request.getGestationalWeeks())
                .weightKg(request.getWeightKg())
                .bloodPressureSystolic(request.getBloodPressureSystolic())
                .bloodPressureDiastolic(request.getBloodPressureDiastolic())
                .hemoglobinGdl(request.getHemoglobinGdl())
                .fundalHeightCm(request.getFundalHeightCm())
                .fetalHeartRate(request.getFetalHeartRate())
                .fetalMovement(request.getFetalMovement())
                .edema(request.getEdema() != null ? request.getEdema() : false)
                .proteinuria(request.getProteinuria() != null ? request.getProteinuria() : false)
                .urineGlucose(request.getUrineGlucose())
                .ironFolicGiven(request.getIronFolicGiven() != null ? request.getIronFolicGiven() : false)
                .ttVaccineGiven(request.getTtVaccineGiven() != null ? request.getTtVaccineGiven() : false)
                .iptGiven(request.getIptGiven() != null ? request.getIptGiven() : false)
                .dewormingGiven(request.getDewormingGiven() != null ? request.getDewormingGiven() : false)
                .hivTestDone(request.getHivTestDone() != null ? request.getHivTestDone() : false)
                .hivResult(request.getHivResult())
                .syphilisTestDone(request.getSyphilisTestDone() != null ? request.getSyphilisTestDone() : false)
                .syphilisResult(request.getSyphilisResult())
                .ultrasoundDone(request.getUltrasoundDone() != null ? request.getUltrasoundDone() : false)
                .ultrasoundFindings(request.getUltrasoundFindings())
                .complications(request.getComplications())
                .referred(request.getReferred() != null ? request.getReferred() : false)
                .referralReason(request.getReferralReason())
                .healthFacility(request.getHealthFacility())
                .attendedBy(request.getAttendedBy())
                .notes(request.getNotes())
                .build();

        visit = ancVisitRepository.save(visit);
        log.info("{} visit #{} recorded for pregnancy {}", request.getVisitType(), request.getVisitNumber(), pregnancyId);
        return AncVisitDto.from(visit);
    }

    @Transactional(readOnly = true)
    public List<AncVisitDto> getVisitsForPregnancy(Long pregnancyId) {
        Pregnancy pregnancy = pregnancyRepository.findById(pregnancyId)
                .orElseThrow(() -> new ApiException("Pregnancy not found", HttpStatus.NOT_FOUND, "PREGNANCY_NOT_FOUND"));
        verifyOwnership(pregnancy);
        return ancVisitRepository.findByPregnancyIdAndDeletedAtIsNullOrderByVisitDateAsc(pregnancyId)
                .stream().map(AncVisitDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AncVisitDto> getAncVisits(Long pregnancyId) {
        return getVisitsByType(pregnancyId, "ANC");
    }

    @Transactional(readOnly = true)
    public List<AncVisitDto> getPncVisits(Long pregnancyId) {
        return getVisitsByType(pregnancyId, "PNC");
    }

    private List<AncVisitDto> getVisitsByType(Long pregnancyId, String type) {
        Pregnancy pregnancy = pregnancyRepository.findById(pregnancyId)
                .orElseThrow(() -> new ApiException("Pregnancy not found", HttpStatus.NOT_FOUND, "PREGNANCY_NOT_FOUND"));
        verifyOwnership(pregnancy);
        return ancVisitRepository.findByPregnancyIdAndVisitTypeAndDeletedAtIsNullOrderByVisitNumberAsc(pregnancyId, type)
                .stream().map(AncVisitDto::from).collect(Collectors.toList());
    }

    private void verifyOwnership(Pregnancy pregnancy) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        if (!pregnancy.getMother().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
    }
}
