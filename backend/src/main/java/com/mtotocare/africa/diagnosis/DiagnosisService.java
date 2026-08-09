package com.mtotocare.africa.diagnosis;

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
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;
    private final ChildRepository childRepository;

    @Transactional(readOnly = true)
    public List<DiagnosisDto> getForChild(Long childId) {
        return diagnosisRepository.findByChildIdOrderByDiagnosedAtDesc(childId)
                .stream().map(DiagnosisDto::from).collect(Collectors.toList());
    }

    @Transactional
    public DiagnosisDto add(Long childId, DiagnosisDto dto) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        Diagnosis d = Diagnosis.builder()
                .child(child)
                .doctorId(dto.getDoctorId())
                .doctorName(dto.getDoctorName())
                .condition(dto.getCondition())
                .diagnosisCode(dto.getDiagnosisCode())
                .severity(dto.getSeverity() != null ? dto.getSeverity() : Diagnosis.Severity.MILD)
                .diagnosedAt(dto.getDiagnosedAt())
                .treatmentPlan(dto.getTreatmentPlan())
                .notes(dto.getNotes())
                .build();
        return DiagnosisDto.from(diagnosisRepository.save(d));
    }

    @Transactional
    public DiagnosisDto update(Long id, DiagnosisDto dto) {
        Diagnosis d = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ApiException("Diagnosis not found", HttpStatus.NOT_FOUND, "DIAGNOSIS_NOT_FOUND"));
        if (dto.getCondition() != null) d.setCondition(dto.getCondition());
        if (dto.getDiagnosisCode() != null) d.setDiagnosisCode(dto.getDiagnosisCode());
        if (dto.getSeverity() != null) d.setSeverity(dto.getSeverity());
        if (dto.getDiagnosedAt() != null) d.setDiagnosedAt(dto.getDiagnosedAt());
        if (dto.getTreatmentPlan() != null) d.setTreatmentPlan(dto.getTreatmentPlan());
        if (dto.getNotes() != null) d.setNotes(dto.getNotes());
        if (dto.getDoctorId() != null) d.setDoctorId(dto.getDoctorId());
        if (dto.getDoctorName() != null) d.setDoctorName(dto.getDoctorName());
        return DiagnosisDto.from(diagnosisRepository.save(d));
    }
}
