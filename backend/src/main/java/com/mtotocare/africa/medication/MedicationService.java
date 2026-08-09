package com.mtotocare.africa.medication;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    public List<MedicationDto> getForChild(Long childId) {
        return medicationRepository.findByChildId(childId).stream()
            .map(MedicationDto::from)
            .collect(Collectors.toList());
    }

    public List<MedicationDto> getActive(Long childId) {
        return medicationRepository.findByChildIdAndActive(childId, true).stream()
            .map(MedicationDto::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public MedicationDto add(Long childId, MedicationRequest request) {
        Child child = childRepository.findById(childId)
            .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));

        User currentUser = userRepository.findActiveByEmail(
            SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElse(null);

        Medication med = Medication.builder()
            .child(child)
            .name(request.getName())
            .dosage(request.getDosage())
            .frequency(request.getFrequency())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .prescribedBy(request.getPrescribedBy() != null ? request.getPrescribedBy() : (currentUser != null ? currentUser.getFullName() : null))
            .prescriber(currentUser)
            .active(request.getActive() != null ? request.getActive() : true)
            .notes(request.getNotes())
            .build();
        return MedicationDto.from(medicationRepository.save(med));
    }

    @Transactional
    public MedicationDto update(Long id, MedicationRequest request) {
        Medication med = medicationRepository.findById(id)
            .orElseThrow(() -> new ApiException("Medication not found", HttpStatus.NOT_FOUND, "MEDICATION_NOT_FOUND"));
        if (request.getName() != null) med.setName(request.getName());
        if (request.getDosage() != null) med.setDosage(request.getDosage());
        if (request.getFrequency() != null) med.setFrequency(request.getFrequency());
        if (request.getStartDate() != null) med.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) med.setEndDate(request.getEndDate());
        if (request.getActive() != null) med.setActive(request.getActive());
        if (request.getNotes() != null) med.setNotes(request.getNotes());
        return MedicationDto.from(medicationRepository.save(med));
    }

    @Transactional
    public MedicationDto discontinue(Long id) {
        Medication med = medicationRepository.findById(id)
            .orElseThrow(() -> new ApiException("Medication not found", HttpStatus.NOT_FOUND, "MEDICATION_NOT_FOUND"));
        med.setActive(false);
        return MedicationDto.from(medicationRepository.save(med));
    }

    @Transactional
    public void delete(Long id) {
        if (!medicationRepository.existsById(id)) {
            throw new ApiException("Medication not found", HttpStatus.NOT_FOUND, "MEDICATION_NOT_FOUND");
        }
        medicationRepository.deleteById(id);
    }
}
