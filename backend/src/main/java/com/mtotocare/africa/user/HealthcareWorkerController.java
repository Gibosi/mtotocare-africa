package com.mtotocare.africa.user;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/healthcare-workers")
@RequiredArgsConstructor
public class HealthcareWorkerController {

    private final HealthcareWorkerRepository repository;

    @GetMapping
    public ApiResponse<List<HealthcareWorkerDto>> listAll() {
        return ApiResponse.success(repository.findAll().stream()
                .map(HealthcareWorkerDto::from).collect(Collectors.toList()));
    }

    @GetMapping("/role/{role}")
    public ApiResponse<List<HealthcareWorkerDto>> byRole(@PathVariable String role) {
        return ApiResponse.success(repository.findByWorkerRoleAndAcceptingReferralsTrue(role.toUpperCase())
                .stream().map(HealthcareWorkerDto::from).collect(Collectors.toList()));
    }

    @GetMapping("/doctors")
    public ApiResponse<List<HealthcareWorkerDto>> doctors() {
        return byRole("DOCTOR").getData() != null
                ? ApiResponse.success(byRole("DOCTOR").getData())
                : ApiResponse.success(List.of());
    }

    @GetMapping("/nurses")
    public ApiResponse<List<HealthcareWorkerDto>> nurses() {
        return ApiResponse.success(repository.findByWorkerRoleAndAcceptingReferralsTrue("NURSE")
                .stream().map(HealthcareWorkerDto::from).collect(Collectors.toList()));
    }

    @GetMapping("/midwives")
    public ApiResponse<List<HealthcareWorkerDto>> midwives() {
        return ApiResponse.success(repository.findByWorkerRoleAndAcceptingReferralsTrue("MIDWIFE")
                .stream().map(HealthcareWorkerDto::from).collect(Collectors.toList()));
    }

    @GetMapping("/chws")
    public ApiResponse<List<HealthcareWorkerDto>> communityHealthWorkers() {
        return ApiResponse.success(repository.findByWorkerRoleAndAcceptingReferralsTrue("COMMUNITY_HEALTH_WORKER")
                .stream().map(HealthcareWorkerDto::from).collect(Collectors.toList()));
    }

    @GetMapping("/area/{area}")
    public ApiResponse<List<HealthcareWorkerDto>> byArea(@PathVariable String area,
                                                          @RequestParam(required = false) String role) {
        List<HealthcareWorker> workers = role != null
                ? repository.findByServiceAreaAndWorkerRole(area, role.toUpperCase())
                : repository.findAll().stream()
                    .filter(w -> area.equalsIgnoreCase(w.getServiceArea()))
                    .collect(Collectors.toList());
        return ApiResponse.success(workers.stream().map(HealthcareWorkerDto::from).collect(Collectors.toList()));
    }
}
