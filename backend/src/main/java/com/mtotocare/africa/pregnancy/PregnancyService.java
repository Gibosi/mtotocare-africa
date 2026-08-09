package com.mtotocare.africa.pregnancy;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PregnancyService {

    private final PregnancyRepository pregnancyRepository;
    private final UserRepository userRepository;

    private static final Set<String> HIGH_RISK_FACTORS = Set.of(
        "diabetes", "hypertension", "preeclampsia", "anemia", "hiv",
        "twin", "twins", "age>35", "age<18", "obesity", "previous_cesarean"
    );

    @Transactional
    public PregnancyDto createPregnancy(PregnancyRequest request) {
        User mother = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));

        // Check for existing active pregnancy
        pregnancyRepository.findFirstByMotherIdAndStatusAndDeletedAtIsNullOrderByLastMenstrualPeriodDesc(
                mother.getId(), "ACTIVE")
                .ifPresent(p -> {
                    throw new ApiException("Active pregnancy already exists", HttpStatus.CONFLICT, "ACTIVE_PREGNANCY_EXISTS");
                });

        // Calculate expected due date (LMP + 280 days = 40 weeks)
        LocalDate lmp = request.getLastMenstrualPeriod();
        LocalDate edd = lmp.plusDays(280);
        LocalDate conception = lmp.plusDays(14);

        boolean highRisk = false;
        if (request.getRiskFactors() != null) {
            String lower = request.getRiskFactors().toLowerCase();
            for (String factor : HIGH_RISK_FACTORS) {
                if (lower.contains(factor)) { highRisk = true; break; }
            }
        }

        Pregnancy pregnancy = Pregnancy.builder()
                .mother(mother)
                .lastMenstrualPeriod(lmp)
                .expectedDueDate(edd)
                .conceptionDate(conception)
                .gravida(request.getGravida())
                .para(request.getPara())
                .miscarriages(request.getMiscarriages())
                .bloodGroup(request.getBloodGroup())
                .rhFactor(request.getRhFactor())
                .weightKgPrePregnancy(request.getWeightKgPrePregnancy())
                .heightCm(request.getHeightCm())
                .highRisk(highRisk)
                .riskFactors(request.getRiskFactors())
                .status("ACTIVE")
                .notes(request.getNotes())
                .build();

        pregnancy = pregnancyRepository.save(pregnancy);
        log.info("Pregnancy created: id={}, mother={}, EDD={}, highRisk={}", pregnancy.getId(), mother.getEmail(), edd, highRisk);
        return PregnancyDto.from(pregnancy);
    }

    @Transactional(readOnly = true)
    public List<PregnancyDto> getMyPregnancies() {
        User mother = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        return pregnancyRepository.findByMotherIdAndDeletedAtIsNullOrderByLastMenstrualPeriodDesc(mother.getId())
                .stream().map(PregnancyDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PregnancyDto getActivePregnancy() {
        User mother = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        Pregnancy p = pregnancyRepository.findFirstByMotherIdAndStatusAndDeletedAtIsNullOrderByLastMenstrualPeriodDesc(
                mother.getId(), "ACTIVE")
                .orElseThrow(() -> new ApiException("No active pregnancy", HttpStatus.NOT_FOUND, "NO_ACTIVE_PREGNANCY"));
        return PregnancyDto.from(p);
    }

    @Transactional
    public PregnancyDto recordDelivery(Long id, String deliveryType, String outcome, String babyGender, Double babyWeight) {
        Pregnancy p = pregnancyRepository.findById(id)
                .orElseThrow(() -> new ApiException("Pregnancy not found", HttpStatus.NOT_FOUND, "PREGNANCY_NOT_FOUND"));
        verifyOwnership(p);

        p.setStatus("DELIVERED");
        p.setDeliveryDate(LocalDate.now());
        p.setDeliveryType(deliveryType);
        p.setDeliveryOutcome(outcome);
        p.setBabyGender(babyGender);
        p.setBabyWeightKg(babyWeight);
        return PregnancyDto.from(pregnancyRepository.save(p));
    }

    private void verifyOwnership(Pregnancy p) {
        User mother = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        if (!p.getMother().getId().equals(mother.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
    }
}
