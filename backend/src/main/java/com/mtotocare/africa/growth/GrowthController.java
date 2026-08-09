package com.mtotocare.africa.growth;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/growth")
@RequiredArgsConstructor
public class GrowthController {

    private final GrowthService growthService;

    /** Add a record. childId is in the URL path; the body has the measurement data. */
    @PostMapping("/child/{childId}")
    public ResponseEntity<ApiResponse<GrowthDto>> addRecord(@PathVariable Long childId,
                                                            @Valid @RequestBody GrowthRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Growth record added", growthService.addRecord(childId, request)));
    }

    /** Fallback for clients that post to /growth with childId in the body. */
    @PostMapping
    public ResponseEntity<ApiResponse<GrowthDto>> addRecordNoPath(@Valid @RequestBody GrowthRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Growth record added", growthService.addRecord(null, request)));
    }

    @GetMapping("/child/{childId}")
    public ApiResponse<List<GrowthDto>> getForChild(@PathVariable Long childId) {
        return ApiResponse.success(growthService.getForChild(childId));
    }

    @GetMapping("/child/{childId}/latest")
    public ApiResponse<GrowthDto> getLatest(@PathVariable Long childId) {
        return ApiResponse.success(growthService.getLatest(childId));
    }
}
