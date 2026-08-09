package com.mtotocare.africa.attachment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {
    private Long id;
    private Long childId;
    private String entityType;
    private Long entityId;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
    private String storagePath;
    private String publicUrl;
    private String attachmentType;
    private String category;
    private String description;

    public static AttachmentDto from(Attachment a) {
        return AttachmentDto.builder()
                .id(a.getId())
                .childId(a.getChildId())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .fileName(a.getFileName())
                .originalFileName(a.getOriginalFileName())
                .contentType(a.getContentType())
                .fileSizeBytes(a.getFileSizeBytes())
                .storagePath(a.getStoragePath())
                .publicUrl(a.getPublicUrl())
                .attachmentType(a.getAttachmentType())
                .category(a.getCategory())
                .description(a.getDescription())
                .build();
    }
}
