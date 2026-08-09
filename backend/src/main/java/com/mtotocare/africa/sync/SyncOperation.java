package com.mtotocare.africa.sync;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncOperation {
    private String clientOperationId;
    private String operationType; // CREATE, UPDATE, DELETE
    private String entityType; // children, growth_records, etc.
    private String clientEntityId;
    private Long serverEntityId;
    private Map<String, Object> payload;
    private LocalDateTime clientTimestamp;
}
