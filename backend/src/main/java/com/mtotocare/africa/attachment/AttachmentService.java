package com.mtotocare.africa.attachment;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository repository;
    private final UserRepository userRepository;

    @Value("${app.attachments.storage-path:./uploads}")
    private String storageBasePath;

    @Value("${app.attachments.max-file-size-mb:10}")
    private long maxFileSizeMb;

    @Transactional
    public AttachmentDto upload(MultipartFile file, Long childId, String entityType, Long entityId,
                                  String category, String description) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));

        if (file.isEmpty()) {
            throw new ApiException("Empty file", HttpStatus.BAD_REQUEST, "EMPTY_FILE");
        }
        if (file.getSize() > maxFileSizeMb * 1024 * 1024) {
            throw new ApiException("File too large (max " + maxFileSizeMb + "MB)", HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE");
        }

        try {
            // Create storage path: /storage/userId/YYYY/MM/
            String datePath = java.time.LocalDate.now().toString().replace("-", "/");
            Path userDir = Paths.get(storageBasePath, String.valueOf(user.getId()), datePath);
            Files.createDirectories(userDir);

            String ext = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf('.'));
            }
            String storedName = UUID.randomUUID().toString() + ext;
            Path target = userDir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            Attachment att = Attachment.builder()
                    .user(user)
                    .childId(childId)
                    .entityType(entityType)
                    .entityId(entityId)
                    .fileName(storedName)
                    .originalFileName(originalName)
                    .contentType(file.getContentType())
                    .fileSizeBytes(file.getSize())
                    .storagePath(target.toString())
                    .storageProvider("LOCAL")
                    .publicUrl("/api/attachments/" + storedName + "/download")
                    .attachmentType(detectAttachmentType(file.getContentType()))
                    .category(category)
                    .description(description)
                    .build();

            att = repository.save(att);
            log.info("Attachment uploaded: id={}, user={}, size={} bytes", att.getId(), user.getEmail(), file.getSize());
            return AttachmentDto.from(att);

        } catch (IOException e) {
            log.error("File upload failed", e);
            throw new ApiException("File upload failed: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED");
        }
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> listForChild(Long childId) {
        return repository.findByChildIdAndDeletedAtIsNullOrderByCreatedAtDesc(childId)
                .stream().map(AttachmentDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> listForUser() {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        return repository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId())
                .stream().map(AttachmentDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Attachment getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException("Attachment not found", HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND"));
    }

    @Transactional(readOnly = true)
    public Attachment getByFileName(String fileName) {
        return repository.findByFileNameAndDeletedAtIsNull(fileName)
                .orElseThrow(() -> new ApiException("Attachment not found", HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND"));
    }

    @Transactional
    public void delete(Long id) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        Attachment a = repository.findById(id)
                .orElseThrow(() -> new ApiException("Attachment not found", HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND"));
        if (!a.getUser().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
        a.softDelete();
        repository.save(a);
    }

    private String detectAttachmentType(String contentType) {
        if (contentType == null) return "DOCUMENT";
        if (contentType.startsWith("image/")) return "IMAGE";
        if (contentType.startsWith("video/")) return "VIDEO";
        if (contentType.startsWith("audio/")) return "AUDIO";
        if (contentType.equals("application/pdf")) return "PDF";
        return "DOCUMENT";
    }
}
