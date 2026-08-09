package com.mtotocare.africa.sync;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {

    @Query("SELECT s FROM SyncLog s WHERE s.userId = :userId AND s.syncedAt > :since ORDER BY s.syncedAt DESC")
    List<SyncLog> findUserSyncsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT MAX(s.syncedAt) FROM SyncLog s WHERE s.userId = :userId")
    LocalDateTime findLastSyncTime(@Param("userId") Long userId);
}
