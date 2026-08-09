package com.mtotocare.africa;

import com.mtotocare.africa.auth.AuthResponse;
import com.mtotocare.africa.auth.AuthService;
import com.mtotocare.africa.auth.LoginRequest;
import com.mtotocare.africa.auth.RegisterRequest;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testRegisterAndLogin() {
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Test User");
        register.setEmail("test_" + System.currentTimeMillis() + "@example.com");
        register.setPhoneNumber("+255700" + (System.currentTimeMillis() % 1000000));
        register.setPassword("Password123!");
        register.setConfirmPassword("Password123!");

        AuthResponse response = authService.register(register);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals(register.getEmail(), response.getUser().getEmail());

        // Try login
        LoginRequest login = new LoginRequest();
        login.setEmail(register.getEmail());
        login.setPassword("Password123!");
        AuthResponse loginResponse = authService.login(login, "test-device", "127.0.0.1", "JUnit");
        assertNotNull(loginResponse.getAccessToken());

        // Cleanup
        userRepository.deleteById(response.getUser().getId());
    }

    @Test
    void testRegisterPasswordMismatch() {
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Test User");
        register.setEmail("test2_" + System.currentTimeMillis() + "@example.com");
        register.setPhoneNumber("+255711" + (System.currentTimeMillis() % 1000000));
        register.setPassword("Password123!");
        register.setConfirmPassword("Different123!");

        assertThrows(ApiException.class, () -> authService.register(register));
    }

    @Test
    void testLoginInvalidCredentials() {
        LoginRequest login = new LoginRequest();
        login.setEmail("nonexistent@example.com");
        login.setPassword("WrongPassword");

        assertThrows(ApiException.class, () -> authService.login(login, "test-device", "127.0.0.1", "JUnit"));
    }
}
