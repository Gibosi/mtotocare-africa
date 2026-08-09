package com.mtotocare.africa.auth;

import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.user.ChangePasswordRequest;
import com.mtotocare.africa.user.UserDto;
import com.mtotocare.africa.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final PhoneOtpService phoneOtpService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request,
                                                              HttpServletRequest httpRequest) {
        request.setDeviceId(extractDeviceId(request.getDeviceId(), httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                            HttpServletRequest httpRequest) {
        String deviceId = request.getDeviceId() != null ? request.getDeviceId() : httpRequest.getHeader("X-Device-Id");
        String ip = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.success("Login successful",
                authService.login(request, deviceId, ip, userAgent)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody Map<String, String> body,
                                                              HttpServletRequest httpRequest) {
        String refreshToken = body.get("refreshToken");
        String deviceId = body.get("deviceId") != null ? body.get("deviceId") : httpRequest.getHeader("X-Device-Id");
        return ResponseEntity.ok(ApiResponse.success("Token refreshed",
                authService.refreshToken(refreshToken, deviceId, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"))));
    }

    @PostMapping("/change-password")
    public ApiResponse<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request.getCurrentPassword(), request.getNewPassword());
        return ApiResponse.success("Password changed", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody Map<String, String> body, HttpServletRequest httpRequest) {
        String msg = authService.forgotPassword(body.get("email"), httpRequest.getRemoteAddr());
        return ApiResponse.success(msg, null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("newPassword"));
        return ApiResponse.success("Password reset successfully", null);
    }

    @PostMapping("/verify-email")
    public ApiResponse<String> verifyEmail(@RequestBody(required = false) Map<String, String> body) {
        authService.verifyEmail(body != null ? body.get("token") : null);
        return ApiResponse.success("Email verified", null);
    }

    // =============== FR-003: Phone OTP verification ===============

    /**
     * Request a 6-digit OTP sent to the given phone number.
     * In dev (EMAIL_SANDBOX=true or no SMS gateway), the OTP is returned in the
     * response so the mobile app / tester can use it. In prod, integrate with
     * Africa's Talking or Twilio and remove the dev-only echo.
     */
    @PostMapping("/phone/request-otp")
    public ApiResponse<Map<String, String>> requestPhoneOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phoneNumber");
        if (phone == null || phone.isBlank()) {
            return ApiResponse.error("Phone number is required", "PHONE_REQUIRED");
        }
        String code = phoneOtpService.requestOtp(phone);
        boolean sandbox = "true".equalsIgnoreCase(System.getenv("EMAIL_SANDBOX"));
        Map<String, String> data = new java.util.HashMap<>();
        data.put("phoneNumber", phone);
        data.put("message", "OTP sent to your phone");
        if (sandbox) {
            // In sandbox/dev only, echo the code so testers can use it
            data.put("devCode", code);
        }
        return ApiResponse.success("OTP sent", data);
    }

    /**
     * Verify a phone number with the 6-digit code. Marks the user's
     * phoneVerified=true on success.
     */
    @PostMapping("/phone/verify-otp")
    public ApiResponse<String> verifyPhoneOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phoneNumber");
        String code = body.get("code");
        if (phone == null || code == null) {
            return ApiResponse.error("Phone and code are required", "PHONE_CODE_REQUIRED");
        }
        phoneOtpService.verifyOtp(phone, code);
        return ApiResponse.success("Phone verified", null);
    }

    @GetMapping("/sessions")
    public ApiResponse<List<SessionDto>> listSessions() {
        return ApiResponse.success(authService.listActiveSessions());
    }

    @DeleteMapping("/sessions/{id}")
    public ApiResponse<String> revokeSession(@PathVariable Long id) {
        authService.revokeSession(id);
        return ApiResponse.success("Session revoked", null);
    }

    @PostMapping("/logout-all")
    public ApiResponse<String> logoutAll() {
        authService.logoutAllDevices();
        return ApiResponse.success("All sessions revoked", null);
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout() {
        return ApiResponse.success("Logged out", null);
    }

    @GetMapping("/me")
    public ApiResponse<UserDto> me() {
        return ApiResponse.success(userService.getCurrentUser());
    }

    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("Auth service is running", "OK");
    }

    private String extractDeviceId(String requestDeviceId, HttpServletRequest httpRequest) {
        if (requestDeviceId != null) return requestDeviceId;
        return httpRequest.getHeader("X-Device-Id");
    }
}
