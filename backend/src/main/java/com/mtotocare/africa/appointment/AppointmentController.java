package com.mtotocare.africa.appointment;

import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDto>> book(@Valid @RequestBody AppointmentRequest request) {
        Appointment saved = appointmentService.book(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked", AppointmentDto.from(saved)));
    }

    @GetMapping
    public ApiResponse<List<AppointmentDto>> list() {
        return ApiResponse.success(
                appointmentService.getMyAppointments().stream()
                        .map(AppointmentDto::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/upcoming")
    public ApiResponse<List<AppointmentDto>> upcoming() {
        return ApiResponse.success(
                appointmentService.getUpcoming().stream()
                        .map(AppointmentDto::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ApiResponse<AppointmentDto> getById(@PathVariable Long id) {
        return ApiResponse.success(AppointmentDto.from(appointmentService.getById(id)));
    }

    @GetMapping("/child/{childId}")
    public ApiResponse<List<AppointmentDto>> getByChild(@PathVariable Long childId) {
        return ApiResponse.success(
                appointmentService.getByChild(childId).stream()
                        .map(AppointmentDto::from)
                        .collect(Collectors.toList()));
    }

    @PutMapping("/{id}/confirm")
    public ApiResponse<AppointmentDto> confirm(@PathVariable Long id) {
        return ApiResponse.success("Appointment confirmed", AppointmentDto.from(appointmentService.confirm(id)));
    }

    @PutMapping("/{id}/reschedule")
    public ApiResponse<AppointmentDto> reschedule(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        LocalDateTime newDatetime;
        String reason;
        if (body != null && body.get("appointmentDatetime") != null) {
            newDatetime = LocalDateTime.parse((String) body.get("appointmentDatetime"));
            reason = (String) body.getOrDefault("reason", "No reason provided");
        } else {
            // Fall back to query params (mobile app compatibility)
            throw new ApiException("appointmentDatetime is required in request body", HttpStatus.BAD_REQUEST, "MISSING_DATETIME");
        }
        return ApiResponse.success("Appointment rescheduled", AppointmentDto.from(appointmentService.reschedule(id, newDatetime, reason)));
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<AppointmentDto> cancel(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "Cancelled by user") : "Cancelled by user";
        return ApiResponse.success("Appointment cancelled", AppointmentDto.from(appointmentService.cancel(id, reason)));
    }

    @PutMapping("/{id}/start")
    public ApiResponse<AppointmentDto> start(@PathVariable Long id) {
        return ApiResponse.success("Appointment started", AppointmentDto.from(appointmentService.startAppointment(id)));
    }

    @PutMapping("/{id}/complete")
    public ApiResponse<AppointmentDto> complete(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return ApiResponse.success("Appointment completed", AppointmentDto.from(appointmentService.markCompleted(id, notes)));
    }

    @PutMapping("/{id}/no-show")
    public ApiResponse<AppointmentDto> noShow(@PathVariable Long id) {
        return ApiResponse.success("Marked no-show", AppointmentDto.from(appointmentService.markNoShow(id)));
    }
}
