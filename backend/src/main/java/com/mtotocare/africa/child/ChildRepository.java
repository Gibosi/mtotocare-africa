package com.mtotocare.africa.child;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByParentIdAndDeletedAtIsNull(Long parentId);
    long countByParentIdAndDeletedAtIsNull(Long parentId);

    // Includes soft-deleted children too — needed when permanently removing a
    // parent account, since children.parent_id is ON DELETE RESTRICT and a
    // leftover soft-deleted child would otherwise block the user delete.
    List<Child> findByParentId(Long parentId);

    // Admin/clinical staff "all patients" view.
    List<Child> findByDeletedAtIsNullOrderByCreatedAtDesc();
}
