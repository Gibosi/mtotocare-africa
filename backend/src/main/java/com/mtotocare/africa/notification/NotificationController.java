package com.mtotocare.africa.notification;

import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;
    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<com.mtotocare.africa.common.PageResponse<Notification>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.getForUserPaged(getCurrentUserId(), page, size));
    }

    @GetMapping("/unread")
    public ApiResponse<List<Notification>> getUnread() {
        return ApiResponse.success(service.getUnreadForUser(getCurrentUserId()));
    }

    @GetMapping("/unread/count")
    public ApiResponse<Map<String, Long>> getUnreadCount() {
        return ApiResponse.success(Map.of("count", service.getUnreadCount(getCurrentUserId())));
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Notification> markAsRead(@PathVariable Long id) {
        return ApiResponse.success("Marked as read", service.markAsRead(id));
    }

    @PutMapping("/read-all")
    public ApiResponse<String> markAllAsRead() {
        int updated = service.markAllAsRead(getCurrentUserId());
        return ApiResponse.success(updated + " notifications marked as read", null);
    }

    private Long getCurrentUserId() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"))
                .getId();
    }
}
