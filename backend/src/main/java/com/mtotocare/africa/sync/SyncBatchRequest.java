package com.mtotocare.africa.sync;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncBatchRequest {
    private String deviceId;
    private String clientId;
    private String appVersion;
    private LocalDateTime clientTimestamp;
    private LocalDateTime lastSyncTime;
    private List<SyncOperation> operations;
}
