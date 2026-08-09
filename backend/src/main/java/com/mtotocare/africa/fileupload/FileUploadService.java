package com.mtotocare.africa.fileupload;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * FR-077–080: File upload/download for profile photos and medical documents.
 *
 * Storage backend:
 *   - Local disk (default, great for dev and single-server prod)
 *   - Configure `UPLOAD_DIR=/var/mtotocare/uploads` to use a persistent volume
 *   - In the future, swap the local writer for S3/Cloudinary by changing only
 *     this class — the controller is the same.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService {

    @Value("${UPLOAD_DIR:./uploads}")
    private String uploadDir;

    private Path rootPath;

    @PostConstruct
    public void init() throws IOException {
        this.rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.rootPath);
        log.info("File upload root: {}", this.rootPath);
    }

    /**
     * Save a file under the current user's folder. Returns the public path
     * the client uses to download it (e.g. `/api/files/avatars/uuid.jpg`).
     */
    public Map<String, String> save(String category, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("File is required", HttpStatus.BAD_REQUEST, "FILE_REQUIRED");
        }
        if (file.getSize() > 10L * 1024 * 1024) {
            throw new ApiException("File too large (max 10 MB)", HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException("Only image uploads are supported (jpg, png, webp)",
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_FILE_TYPE");
        }

        String email = SecurityUtils.getCurrentUserEmail();
        String userSlug = email.replaceAll("[^a-zA-Z0-9_-]", "_");
        Path categoryDir = rootPath.resolve(sanitize(category)).resolve(userSlug);
        try {
            Files.createDirectories(categoryDir);
            String ext = guessExt(contentType, file.getOriginalFilename());
            String filename = UUID.randomUUID().toString().replace("-", "") + ext;
            Path target = categoryDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file {} ({} bytes) for user {}", filename, file.getSize(), email);
            return Map.of(
                    "url", sanitize(category) + "/" + userSlug + "/" + filename,
                    "publicUrl", "/api/files/download?path=" + sanitize(category) + "/" + userSlug + "/" + filename,
                    "filename", filename,
                    "size", String.valueOf(file.getSize()),
                    "contentType", contentType
            );
        } catch (IOException e) {
            log.error("Failed to save file", e);
            throw new ApiException("Failed to save file: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR, "FILE_SAVE_FAILED");
        }
    }

    public Path resolve(String relativePath) {
        Path target = rootPath.resolve(relativePath).normalize();
        if (!target.startsWith(rootPath)) {
            throw new ApiException("Invalid path", HttpStatus.BAD_REQUEST, "INVALID_PATH");
        }
        return target;
    }

    private String sanitize(String s) {
        return s == null ? "misc" : s.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    private String guessExt(String contentType, String originalFilename) {
        if (originalFilename != null && originalFilename.contains(".")) {
            String e = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            if (e.length() <= 5) return e;
        }
        if (contentType.contains("jpeg")) return ".jpg";
        if (contentType.contains("png")) return ".png";
        if (contentType.contains("webp")) return ".webp";
        if (contentType.contains("gif")) return ".gif";
        return ".bin";
    }
}
