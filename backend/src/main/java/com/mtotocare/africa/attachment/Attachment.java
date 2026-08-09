package com.mtotocare.africa.attachment;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "attachments", indexes = {
    @Index(name = "idx_attach_user", columnList = "user_id"),
    @Index(name = "idx_attach_child", columnList = "child_id"),
    @Index(name = "idx_attach_entity", columnList = "entity_type,entity_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "child_id")
    private Long childId;

    @Column(name = "entity_type", length = 50)
    private String entityType; // CHILD, GROWTH_RECORD, MEDICAL_RECORD, VACCINATION, PREGNANCY, ANC_VISIT

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "original_file_name", length = 255)
    private String originalFileName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "storage_path", nullable = false, length = 1000)
    private String storagePath;

    @Column(name = "storage_provider", length = 20)
    @Builder.Default
    private String storageProvider = "LOCAL"; // LOCAL, S3, GCS

    @Column(name = "public_url", length = 1000)
    private String publicUrl;

    @Column(name = "attachment_type", length = 30)
    private String attachmentType; // PHOTO, DOCUMENT, PDF, IMAGE, AUDIO

    @Column(name = "category", length = 50)
    private String category; // BIRTH_CERTIFICATE, VACCINATION_CARD, LAB_RESULT, PROFILE_PICTURE, GROWTH_CHART, ULTRASOUND

    @Column(name = "description", length = 500)
    private String description;
}
