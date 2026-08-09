package com.mtotocare.africa.facility;

import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityRepository facilityRepository;

    @GetMapping
    public ApiResponse<List<Facility>> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String type) {
        return ApiResponse.success(facilityRepository.findByActiveTrue());
    }

    @GetMapping("/{id}")
    public ApiResponse<Facility> getById(@PathVariable Long id) {
        return ApiResponse.success(facilityRepository.findById(id)
                .orElseThrow(() -> new ApiException("Facility not found", HttpStatus.NOT_FOUND, "FACILITY_NOT_FOUND")));
    }

    @GetMapping("/region/{region}")
    public ApiResponse<List<Facility>> getByRegion(@PathVariable String region) {
        return ApiResponse.success(facilityRepository.findByRegionAndActiveTrue(region));
    }

    @GetMapping("/type/{type}")
    public ApiResponse<List<Facility>> getByType(@PathVariable String type) {
        return ApiResponse.success(facilityRepository.findByFacilityTypeAndActiveTrue(type));
    }

    @PostMapping
    public ApiResponse<Facility> create(@RequestBody Map<String, Object> body) {
        Facility f = Facility.builder()
                .name((String) body.getOrDefault("name", "New Facility"))
                .facilityType((String) body.getOrDefault("facilityType", "HEALTH_CENTER"))
                .address((String) body.getOrDefault("address", ""))
                .region((String) body.getOrDefault("region", ""))
                .district((String) body.getOrDefault("district", ""))
                .phoneNumber((String) body.getOrDefault("phoneNumber", ""))
                .operatingHours((String) body.getOrDefault("operatingHours", "24/7"))
                .active(true)
                .build();
        return ApiResponse.success("Facility created", facilityRepository.save(f));
    }

    @PutMapping("/{id}")
    public ApiResponse<Facility> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Facility f = facilityRepository.findById(id)
                .orElseThrow(() -> new ApiException("Facility not found", HttpStatus.NOT_FOUND, "FACILITY_NOT_FOUND"));
        if (body.get("name") != null) f.setName((String) body.get("name"));
        if (body.get("facilityType") != null) f.setFacilityType((String) body.get("facilityType"));
        if (body.get("address") != null) f.setAddress((String) body.get("address"));
        if (body.get("region") != null) f.setRegion((String) body.get("region"));
        if (body.get("district") != null) f.setDistrict((String) body.get("district"));
        if (body.get("phoneNumber") != null) f.setPhoneNumber((String) body.get("phoneNumber"));
        if (body.get("operatingHours") != null) f.setOperatingHours((String) body.get("operatingHours"));
        if (body.get("active") != null) f.setActive((Boolean) body.get("active"));
        return ApiResponse.success("Facility updated", facilityRepository.save(f));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new ApiException("Facility not found", HttpStatus.NOT_FOUND, "FACILITY_NOT_FOUND");
        }
        facilityRepository.deleteById(id);
        return ApiResponse.success("Facility deleted", null);
    }
}
