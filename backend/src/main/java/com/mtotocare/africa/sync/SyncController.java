package com.mtotocare.africa.sync;

import com.mtotocare.africa.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/sync")
@RequiredArgsConstructor
@Tag(name = "Sync", description = "Offline-first sync endpoints for mobile clients")
public class SyncController {

    private final SyncService syncService;

    @PostMapping("/batch")
    @Operation(summary = "Process batch sync (upload + download delta)")
    public ResponseEntity<ApiResponse<SyncBatchResponse>> batchSync(@RequestBody SyncBatchRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Sync completed", syncService.processBatchSync(request)));
    }

    @GetMapping("/info")
    @Operation(summary = "Get sync metadata (last sync time, server time)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSyncInfo() {
        return ResponseEntity.ok(ApiResponse.success(syncService.getSyncInfo()));
    }
}
