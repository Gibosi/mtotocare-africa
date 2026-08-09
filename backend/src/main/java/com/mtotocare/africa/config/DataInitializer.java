package com.mtotocare.africa.config;

import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Seeds ONLY the default admin account.
 *
 * NO demo doctors, NO demo facilities, NO demo children, NO vaccination
 * schedule. The system starts with a clean database containing a single
 * admin user. The first person to register through the mobile app
 * becomes the first parent. Doctors, facilities, and children are all
 * created by the admin from the web admin portal (or by parents in the
 * mobile app) once the system is live.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {
        if (userRepository.findByEmail("admin@mtotocare.africa").isPresent()) {
            log.info("Admin user already exists, skipping seed.");
            return;
        }
        log.info("Seeding default admin user...");
        User admin = User.builder()
                .email("admin@mtotocare.africa")
                .phoneNumber("+255700000000")
                .fullName("System Admin")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .preferredLanguage("en")
                .active(true)
                .emailVerified(true)
                .phoneVerified(true)
                .healthcareProvider(false)
                .roles(Set.of("ADMIN"))
                .build();
        userRepository.save(admin);
        log.info("Seeded admin user: admin@mtotocare.africa / Admin123!");
        log.info("!!! CHANGE THE ADMIN PASSWORD ON FIRST LOGIN !!!");
    }
}
