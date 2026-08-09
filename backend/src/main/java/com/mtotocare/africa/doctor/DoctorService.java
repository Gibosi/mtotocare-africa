package com.mtotocare.africa.doctor;

import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    @Transactional
    public DoctorDto createDoctor(DoctorCreateRequest request) {
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new ApiException("License number already registered", HttpStatus.CONFLICT, "LICENSE_EXISTS");
        }

        User user = userRepository.findActiveByEmail(request.getEmail())
            .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        Doctor doctor = Doctor.builder()
            .user(user)
            .licenseNumber(request.getLicenseNumber())
            .specialization(request.getSpecialization())
            .subSpecialty(request.getSubSpecialty())
            .qualifications(request.getQualifications())
            .languages(request.getLanguages())
            .yearsOfExperience(request.getYearsOfExperience())
            .bio(request.getBio())
            .acceptingNewPatients(true)
            .consultationFee(request.getConsultationFee())
            .build();

        doctor = doctorRepository.save(doctor);
        return DoctorDto.from(doctor);
    }

    public List<DoctorDto> getAll() {
        return doctorRepository.findAll().stream().map(DoctorDto::from).toList();
    }

    public DoctorDto getById(Long id) {
        Doctor d = doctorRepository.findById(id)
            .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND, "DOCTOR_NOT_FOUND"));
        return DoctorDto.from(d);
    }

    public DoctorDto getByUserId(Long userId) {
        Doctor d = doctorRepository.findByUser_Id(userId)
            .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND, "DOCTOR_NOT_FOUND"));
        return DoctorDto.from(d);
    }

    public Optional<DoctorDto> findByUserIdOptional(Long userId) {
        return doctorRepository.findByUser_Id(userId).map(DoctorDto::from);
    }

    @Transactional
    public DoctorDto update(Long id, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND, "DOCTOR_NOT_FOUND"));
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getSubSpecialty() != null) doctor.setSubSpecialty(request.getSubSpecialty());
        if (request.getQualifications() != null) doctor.setQualifications(request.getQualifications());
        if (request.getLanguages() != null) doctor.setLanguages(request.getLanguages());
        if (request.getYearsOfExperience() != null) doctor.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getBio() != null) doctor.setBio(request.getBio());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getAcceptingNewPatients() != null) doctor.setAcceptingNewPatients(request.getAcceptingNewPatients());
        return DoctorDto.from(doctorRepository.save(doctor));
    }

    public List<DoctorDto> findBySpecialization(String spec) {
        return doctorRepository.findBySpecialization(spec).stream().map(DoctorDto::from).toList();
    }
}
