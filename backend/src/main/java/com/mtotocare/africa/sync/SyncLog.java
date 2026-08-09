package com.mtotocare.africa.sync;

import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sync_logs", indexes = {
    @Index(name = "idx_sync_user", columnList = "user_id"),
    @Index(name = "idx_sync_time", columnList = "synced_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "client_id", length = 100)
    private String clientId;

    @Column(name = "operation", nullable = false, length = 20)
    private String operation;

    @Column(name = "records_uploaded")
    @Builder.Default
    private Integer recordsUploaded = 0;

    @Column(name = "records_downloaded")
    @Builder.Default
    private Integer recordsDownloaded = 0;

    @Column(name = "conflicts_resolved")
    @Builder.Default
    private Integer conflictsResolved = 0;

    @Column(name = "synced_at", nullable = false)
    private LocalDateTime syncedAt;

    @Column(name = "client_timestamp")
    private LocalDateTime clientTimestamp;

    @Column(name = "app_version", length = 20)
    private String appVersion;
}
