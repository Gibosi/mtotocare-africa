package com.mtotocare.africa.fileupload;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

/**
 * FR-077 / FR-078: Upload profile photos and medical documents.
 * FR-079 / FR-080: Files are stored on local disk (configurable via UPLOAD_DIR);
 * download is served back at /files/download?path=avatars/user_at_example_com/abc.jpg
 */
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileUploadService uploadService;

    /**
     * Upload an image. Category is one of: avatars, children, documents.
     * The current authenticated user becomes the owner of the file.
     */
    @PostMapping("/upload/{category}")
    public ApiResponse<Map<String, String>> upload(
            @PathVariable String category,
            @RequestParam("file") MultipartFile file
    ) {
        return ApiResponse.success("File uploaded", uploadService.save(category, file));
    }

    /**
     * Download a previously uploaded file.
     * The `path` query param is the relative path returned by /upload.
     * Strips a leading /api/files/ if present so it works with both
     * the raw relative path and the public API URL.
     */
    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam("path") String path) throws MalformedURLException {
        if (path == null || path.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // Strip leading "/api/files" if the client passed the public URL
        String relative = path;
        if (relative.startsWith("/api/files/")) {
            relative = relative.substring("/api/files/".length());
        } else if (relative.startsWith("api/files/")) {
            relative = relative.substring("api/files/".length());
        } else if (relative.startsWith("/")) {
            relative = relative.substring(1);
        }
        Path file = uploadService.resolve(relative);
        if (!Files.exists(file) || Files.isDirectory(file)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(file.toUri());
        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(file);
        } catch (IOException ignored) {
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }
}
