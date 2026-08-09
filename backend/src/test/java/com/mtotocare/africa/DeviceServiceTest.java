package com.mtotocare.africa;

import com.mtotocare.africa.auth.AuthService;
import com.mtotocare.africa.auth.RegisterRequest;
import com.mtotocare.africa.device.DeviceDto;
import com.mtotocare.africa.device.DeviceRequest;
import com.mtotocare.africa.device.DeviceService;
import com.mtotocare.africa.emergency.EmergencyContactDto;
import com.mtotocare.africa.emergency.EmergencyContactRequest;
import com.mtotocare.africa.emergency.EmergencyContactService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class DeviceServiceTest {

    @Autowired private DeviceService deviceService;
    @Autowired private EmergencyContactService emergencyService;
    @Autowired private AuthService authService;

    private String testEmail;

    @BeforeEach
    void setUp() {
        testEmail = "device_test_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Device Test");
        register.setEmail(testEmail);
        register.setPhoneNumber("+255740" + (System.currentTimeMillis() % 1000000));
        register.setPassword("Password123!");
        register.setConfirmPassword("Password123!");
        authService.register(register);

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(testEmail, null, java.util.Collections.emptyList())
        );
    }

    @Test
    void testRegisterDevice() {
        DeviceRequest req = new DeviceRequest();
        req.setDeviceId("test-device-1");
        req.setPlatform("ANDROID");
        req.setAppVersion("1.0.0");
        req.setPushToken("fcm-token-abc");
        req.setBiometricEnabled(true);
        req.setLocale("sw");

        DeviceDto d = deviceService.registerOrUpdate(req);
        assertNotNull(d.getId());
        assertEquals("test-device-1", d.getDeviceId());
        assertEquals("ANDROID", d.getPlatform());
        assertTrue(d.getBiometricEnabled());
    }

    @Test
    void testUpdateExistingDevice() {
        DeviceRequest req = new DeviceRequest();
        req.setDeviceId("test-device-1");
        req.setPlatform("IOS");
        req.setBiometricEnabled(false);

        deviceService.registerOrUpdate(req);

        req.setPlatform("ANDROID");
        req.setBiometricEnabled(true);
        deviceService.registerOrUpdate(req);

        List<DeviceDto> devices = deviceService.listMyDevices();
        assertEquals(1, devices.size());
        assertEquals("ANDROID", devices.get(0).getPlatform());
        assertTrue(devices.get(0).getBiometricEnabled());
    }

    @Test
    void testAddEmergencyContact() {
        EmergencyContactRequest req = new EmergencyContactRequest();
        req.setName("Spouse");
        req.setRelationship("SPOUSE");
        req.setPhoneNumber("+255700000000");
        req.setIsPrimary(true);
        req.setPriority(1);
        req.setCanPickupChild(true);

        EmergencyContactDto c = emergencyService.add(req);
        assertNotNull(c.getId());
        assertTrue(c.getIsPrimary());
    }

    @Test
    void testPrimaryContactReplacesPrevious() {
        EmergencyContactRequest r1 = new EmergencyContactRequest();
        r1.setName("Contact 1");
        r1.setPhoneNumber("+255700000001");
        r1.setIsPrimary(true);
        r1.setPriority(1);
        emergencyService.add(r1);

        EmergencyContactRequest r2 = new EmergencyContactRequest();
        r2.setName("Contact 2");
        r2.setPhoneNumber("+255700000002");
        r2.setIsPrimary(true);
        r2.setPriority(2);
        emergencyService.add(r2);

        List<EmergencyContactDto> list = emergencyService.list();
        assertEquals(2, list.size());
        long primaryCount = list.stream().filter(EmergencyContactDto::getIsPrimary).count();
        assertEquals(1, primaryCount);
    }
}
