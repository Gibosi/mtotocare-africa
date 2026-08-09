package com.mtotocare.africa.attachment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
    List<Attachment> findByChildIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long childId);
    List<Attachment> findByEntityTypeAndEntityIdAndDeletedAtIsNull(String entityType, Long entityId);
    List<Attachment> findByUserIdAndCategoryAndDeletedAtIsNull(Long userId, String category);
    Optional<Attachment> findByFileNameAndDeletedAtIsNull(String fileName);
}
