package com.mtotocare.africa.doctor;

import com.mtotocare.africa.appointment.Appointment;
import com.mtotocare.africa.appointment.AppointmentDto;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final com.mtotocare.africa.appointment.AppointmentRepository appointmentRepository;

    @GetMapping
    public ApiResponse<List<DoctorDto>> getAll(@RequestParam(required = false) String specialization,
                                               @RequestParam(required = false) Long facilityId,
                                               @RequestParam(required = false) Boolean onDutyOnly) {
        List<DoctorDto> doctors;
        if (onDutyOnly != null && onDutyOnly) {
            doctors = doctorRepository.findByAcceptingNewPatientsTrue().stream()
                .map(DoctorDto::from).collect(Collectors.toList());
        } else if (specialization != null) {
            doctors = doctorService.findBySpecialization(specialization);
        } else {
            doctors = doctorService.getAll();
        }
        return ApiResponse.success(doctors);
    }

    @GetMapping("/{id}")
    public ApiResponse<DoctorDto> getById(@PathVariable Long id) {
        return ApiResponse.success(doctorService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<DoctorDto> getByUserId(@PathVariable Long userId) {
        return ApiResponse.success(doctorService.getByUserId(userId));
    }

    @GetMapping("/me")
    public ApiResponse<DoctorDto> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findActiveByEmail(email)
            .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        return ApiResponse.success(doctorService.getByUserId(user.getId()));
    }

    @GetMapping("/me/patients")
    public ApiResponse<List<Child>> myPatients() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findActiveByEmail(email)
            .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        Doctor doctor = doctorRepository.findByUser_Id(user.getId())
            .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND, "DOCTOR_NOT_FOUND"));
        // No dedicated doctor-patient assignment table exists yet — derive
        // "my patients" from children who have (or have had) an appointment
        // with this doctor, which is the real relationship the app tracks.
        List<Child> patients = appointmentRepository.findByDoctorIdOrderByAppointmentDatetimeAsc(doctor.getId())
            .stream()
            .map(Appointment::getChild)
            .filter(java.util.Objects::nonNull)
            .collect(java.util.stream.Collectors.toMap(Child::getId, c -> c, (a, b) -> a, java.util.LinkedHashMap::new))
            .values()
            .stream()
            .collect(Collectors.toList());
        return ApiResponse.success(patients);
    }

    @GetMapping("/me/appointments")
    public ApiResponse<List<AppointmentDto>> myAppointments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findActiveByEmail(email)
            .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        Doctor doctor = doctorRepository.findByUser_Id(user.getId())
            .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND, "DOCTOR_NOT_FOUND"));
        List<AppointmentDto> appointments = appointmentRepository
            .findByDoctorIdOrderByAppointmentDatetimeAsc(doctor.getId())
            .stream()
            .map(AppointmentDto::from)
            .collect(Collectors.toList());
        return ApiResponse.success(appointments);
    }

    @PutMapping("/me/availability")
    public ApiResponse<DoctorDto> updateAvailability(@RequestBody AvailabilityRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findActiveByEmail(email)
            .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        // Auto-create the Doctor profile if it doesn't exist yet.
        // This makes the on-duty toggle work for any user with the DOCTOR role,
        // without requiring a separate "create doctor profile" step.
        Doctor doctor = doctorRepository.findByUser_Id(user.getId())
            .orElseGet(() -> {
                Doctor d = new Doctor();
                d.setUser(user);
                d.setSpecialization(user.getSpecialization() != null
                        ? user.getSpecialization() : "General Practice");
                d.setLicenseNumber(user.getLicenseNumber() != null
                        ? user.getLicenseNumber() : "PENDING");
                d.setAcceptingNewPatients(request.getIsOnDuty() != null ? request.getIsOnDuty() : true);
                return doctorRepository.save(d);
            });
        doctor.setAcceptingNewPatients(request.getIsOnDuty());
        return ApiResponse.success("Availability updated", DoctorDto.from(doctorRepository.save(doctor)));
    }

    @PostMapping
    public ApiResponse<DoctorDto> create(@RequestBody DoctorCreateRequest request) {
        return ApiResponse.success("Doctor profile created", doctorService.createDoctor(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<DoctorDto> update(@PathVariable Long id, @RequestBody DoctorUpdateRequest request) {
        return ApiResponse.success("Doctor updated", doctorService.update(id, request));
    }

    public static class AvailabilityRequest {
        private Boolean isOnDuty;
        public Boolean getIsOnDuty() { return isOnDuty; }
        public void setIsOnDuty(Boolean isOnDuty) { this.isOnDuty = isOnDuty; }
    }
}
