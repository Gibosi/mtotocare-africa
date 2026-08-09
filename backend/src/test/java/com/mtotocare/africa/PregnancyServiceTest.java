package com.mtotocare.africa;

import com.mtotocare.africa.auth.AuthService;
import com.mtotocare.africa.auth.RegisterRequest;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.pregnancy.PregnancyDto;
import com.mtotocare.africa.pregnancy.PregnancyRequest;
import com.mtotocare.africa.pregnancy.PregnancyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class PregnancyServiceTest {

    @Autowired private PregnancyService pregnancyService;
    @Autowired private AuthService authService;

    private String testEmail;

    @BeforeEach
    void setUp() {
        testEmail = "preg_test_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Preg Test");
        register.setEmail(testEmail);
        register.setPhoneNumber("+255730" + (System.currentTimeMillis() % 1000000));
        register.setPassword("Password123!");
        register.setConfirmPassword("Password123!");
        authService.register(register);

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(testEmail, null, java.util.Collections.emptyList())
        );
    }

    @Test
    void testCreatePregnancy() {
        PregnancyRequest request = new PregnancyRequest();
        request.setLastMenstrualPeriod(LocalDate.now().minusWeeks(20));
        request.setGravida(1);
        request.setPara(0);
        request.setBloodGroup("O+");
        request.setRhFactor("Positive");
        request.setWeightKgPrePregnancy(60.0);
        request.setHeightCm(165.0);
        request.setRiskFactors("age>35");

        PregnancyDto p = pregnancyService.createPregnancy(request);
        assertNotNull(p.getId());
        assertNotNull(p.getExpectedDueDate());
        assertEquals(2, p.getTrimester()); // 20 weeks = T2 (13-26)
        assertTrue(p.getHighRisk()); // age>35 is high risk
    }

    @Test
    void testDuplicateActivePregnancyFails() {
        PregnancyRequest r = new PregnancyRequest();
        r.setLastMenstrualPeriod(LocalDate.now().minusWeeks(8));
        pregnancyService.createPregnancy(r);

        PregnancyRequest r2 = new PregnancyRequest();
        r2.setLastMenstrualPeriod(LocalDate.now().minusWeeks(4));
        assertThrows(ApiException.class, () -> pregnancyService.createPregnancy(r2));
    }

    @Test
    void testGetActivePregnancy() {
        PregnancyRequest r = new PregnancyRequest();
        r.setLastMenstrualPeriod(LocalDate.now().minusWeeks(20));
        pregnancyService.createPregnancy(r);

        PregnancyDto active = pregnancyService.getActivePregnancy();
        assertNotNull(active);
        assertEquals("ACTIVE", active.getStatus());
        assertTrue(active.getCurrentWeek() >= 20);
    }

    @Test
    void testRecordDelivery() {
        PregnancyRequest r = new PregnancyRequest();
        r.setLastMenstrualPeriod(LocalDate.now().minusWeeks(40));
        PregnancyDto p = pregnancyService.createPregnancy(r);

        PregnancyDto delivered = pregnancyService.recordDelivery(p.getId(),
                "VAGINAL", "LIVE_BIRTH", "FEMALE", 3.2);
        assertEquals("DELIVERED", delivered.getStatus());
        assertEquals("FEMALE", delivered.getBabyGender());
        assertEquals(3.2, delivered.getBabyWeightKg());
    }

    @Test
    void testListMyPregnancies() {
        PregnancyRequest r1 = new PregnancyRequest();
        r1.setLastMenstrualPeriod(LocalDate.now().minusWeeks(40));
        PregnancyDto p1 = pregnancyService.createPregnancy(r1);
        pregnancyService.recordDelivery(p1.getId(), "VAGINAL", "LIVE_BIRTH", "MALE", 3.5);

        PregnancyRequest r2 = new PregnancyRequest();
        r2.setLastMenstrualPeriod(LocalDate.now().minusWeeks(10));
        pregnancyService.createPregnancy(r2);

        List<PregnancyDto> all = pregnancyService.getMyPregnancies();
        assertEquals(2, all.size());
    }
}
