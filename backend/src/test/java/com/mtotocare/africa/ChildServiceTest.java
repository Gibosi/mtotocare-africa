package com.mtotocare.africa;

import com.mtotocare.africa.auth.AuthService;
import com.mtotocare.africa.auth.RegisterRequest;
import com.mtotocare.africa.child.ChildCreateRequest;
import com.mtotocare.africa.child.ChildDto;
import com.mtotocare.africa.child.ChildRequest;
import com.mtotocare.africa.child.ChildService;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.vaccination.VaccinationRepository;
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
class ChildServiceTest {

    @Autowired private ChildService childService;
    @Autowired private AuthService authService;
    @Autowired private VaccinationRepository vaccinationRepository;

    private String testEmail;

    @BeforeEach
    void setUp() {
        testEmail = "child_test_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Child Test");
        register.setEmail(testEmail);
        register.setPhoneNumber("+255700" + (System.currentTimeMillis() % 1000000));
        register.setPassword("Password123!");
        register.setConfirmPassword("Password123!");
        authService.register(register);

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(testEmail, null, java.util.Collections.emptyList())
        );
    }

    @Test
    void testAddChildGeneratesSchedule() {
        ChildCreateRequest request = new ChildCreateRequest();
        request.setFirstName("Alice");
        request.setDateOfBirth(LocalDate.now().minusYears(2));
        request.setGender("FEMALE");
        request.setBloodGroup("A+");

        ChildDto child = childService.addChild(request);
        assertNotNull(child.getId());
        assertEquals("Alice", child.getFirstName());
        assertEquals(2, child.getAgeInYears());

        // 13 EPI vaccines should be auto-generated
        long count = vaccinationRepository.findAll().stream()
            .filter(v -> v.getChild() != null && v.getChild().getId().equals(child.getId()))
            .count();
        assertEquals(13, count);
    }

    @Test
    void testGetChildrenForParent() {
        ChildCreateRequest r1 = new ChildCreateRequest();
        r1.setFirstName("Bob");
        r1.setDateOfBirth(LocalDate.now().minusYears(1));
        r1.setGender("MALE");
        childService.addChild(r1);

        ChildCreateRequest r2 = new ChildCreateRequest();
        r2.setFirstName("Carol");
        r2.setDateOfBirth(LocalDate.now().minusMonths(6));
        r2.setGender("FEMALE");
        childService.addChild(r2);

        List<ChildDto> children = childService.getChildrenForParent();
        assertEquals(2, children.size());
    }

    @Test
    void testUpdateChildPartial() {
        ChildCreateRequest create = new ChildCreateRequest();
        create.setFirstName("Dave");
        create.setDateOfBirth(LocalDate.now().minusYears(3));
        create.setGender("MALE");
        ChildDto created = childService.addChild(create);

        ChildRequest update = new ChildRequest();
        update.setLastName("Smith");
        ChildDto updated = childService.updateChild(created.getId(), update);
        assertEquals("Smith", updated.getLastName());
        assertEquals("Dave", updated.getFirstName()); // unchanged
    }

    @Test
    void testUpdateChildNotFound() {
        ChildRequest update = new ChildRequest();
        update.setLastName("X");
        assertThrows(ApiException.class, () -> childService.updateChild(99999L, update));
    }

    @Test
    void testDeleteChildSoftDeletes() {
        ChildCreateRequest create = new ChildCreateRequest();
        create.setFirstName("Eve");
        create.setDateOfBirth(LocalDate.now().minusYears(1));
        create.setGender("FEMALE");
        ChildDto created = childService.addChild(create);

        childService.deleteChild(created.getId());

        // Soft-deleted: not visible in getChildrenForParent
        List<ChildDto> remaining = childService.getChildrenForParent();
        assertTrue(remaining.stream().noneMatch(c -> c.getId().equals(created.getId())));
    }
}
