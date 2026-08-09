package com.mtotocare.africa.allergy;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllergyService {

    private final AllergyRepository allergyRepository;
    private final ChildRepository childRepository;

    @Transactional(readOnly = true)
    public List<AllergyDto> getForChild(Long childId) {
        return allergyRepository.findByChildIdOrderByDiagnosedAtDesc(childId)
                .stream().map(AllergyDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AllergyDto> getCritical(Long childId) {
        return allergyRepository.findByChildIdAndSeverityIn(childId,
                        List.of(Allergy.Severity.SEVERE, Allergy.Severity.CRITICAL))
                .stream().map(AllergyDto::from).collect(Collectors.toList());
    }

    @Transactional
    public AllergyDto add(Long childId, AllergyRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        Allergy allergy = Allergy.builder()
                .child(child)
                .allergen(request.getAllergen())
                .reaction(request.getReaction())
                .severity(request.getSeverity() != null ? request.getSeverity() : Allergy.Severity.MILD)
                .diagnosedAt(request.getDiagnosedAt())
                .notes(request.getNotes())
                .build();
        return AllergyDto.from(allergyRepository.save(allergy));
    }

    @Transactional
    public AllergyDto update(Long id, AllergyRequest request) {
        Allergy allergy = allergyRepository.findById(id)
                .orElseThrow(() -> new ApiException("Allergy not found", HttpStatus.NOT_FOUND, "ALLERGY_NOT_FOUND"));
        if (request.getAllergen() != null) allergy.setAllergen(request.getAllergen());
        if (request.getReaction() != null) allergy.setReaction(request.getReaction());
        if (request.getSeverity() != null) allergy.setSeverity(request.getSeverity());
        if (request.getDiagnosedAt() != null) allergy.setDiagnosedAt(request.getDiagnosedAt());
        if (request.getNotes() != null) allergy.setNotes(request.getNotes());
        return AllergyDto.from(allergyRepository.save(allergy));
    }

    @Transactional
    public void delete(Long id) {
        if (!allergyRepository.existsById(id)) {
            throw new ApiException("Allergy not found", HttpStatus.NOT_FOUND, "ALLERGY_NOT_FOUND");
        }
        allergyRepository.deleteById(id);
    }
}
