package com.mtotocare.africa.sync;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncBatchResponse {
    private String syncId;
    private LocalDateTime serverTimestamp;
    private List<OperationResult> results;
    private Integer totalUploaded;
    private Integer totalDownloaded;
    private Integer conflictsResolved;
    private DeltaData delta;
}
