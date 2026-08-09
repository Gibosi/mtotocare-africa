package com.mtotocare.africa.attachment;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService service;

    @PostMapping("/upload")
    public ApiResponse<AttachmentDto> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "childId", required = false) Long childId,
            @RequestParam(value = "entityType", required = false) String entityType,
            @RequestParam(value = "entityId", required = false) Long entityId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description) {
        return ApiResponse.success("File uploaded", service.upload(file, childId, entityType, entityId, category, description));
    }

    @GetMapping
    public ApiResponse<List<AttachmentDto>> listAll() {
        return ApiResponse.success(service.listForUser());
    }

    @GetMapping("/child/{childId}")
    public ApiResponse<List<AttachmentDto>> listForChild(@PathVariable Long childId) {
        return ApiResponse.success(service.listForChild(childId));
    }

    @GetMapping("/{fileName}/download")
    public ResponseEntity<Resource> download(@PathVariable String fileName) {
        try {
            Attachment att = service.getByFileName(fileName);
            Path file = Paths.get(att.getStoragePath());
            if (!Files.exists(file)) {
                return ResponseEntity.notFound().build();
            }
            MediaType ct = att.getContentType() != null
                    ? MediaType.parseMediaType(att.getContentType())
                    : MediaType.APPLICATION_OCTET_STREAM;
            return ResponseEntity.ok()
                    .contentType(ct)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + (att.getOriginalFileName() != null ? att.getOriginalFileName() : fileName) + "\"")
                    .body(new FileSystemResource(file));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Attachment deleted", null);
    }
}
