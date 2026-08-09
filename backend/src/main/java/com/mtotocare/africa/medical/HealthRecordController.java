package com.mtotocare.africa.medical;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
public class HealthRecordController {

    private final HealthRecordService service;

    @PostMapping("/child/{childId}")
    public ResponseEntity<ApiResponse<HealthRecord>> add(@PathVariable Long childId, @RequestBody HealthRecord record) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Health record added", service.add(childId, record)));
    }

    @GetMapping("/child/{childId}")
    public ApiResponse<List<HealthRecord>> getForChild(@PathVariable Long childId) {
        return ApiResponse.success(service.getForChild(childId));
    }
}
