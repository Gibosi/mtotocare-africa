package com.mtotocare.africa.emergency;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmergencyContactService {

    private final EmergencyContactRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public EmergencyContactDto add(EmergencyContactRequest request) {
        User user = getCurrentUser();

        // If marked primary, unset other primaries
        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            repository.findByUserIdAndIsPrimaryTrueAndDeletedAtIsNull(user.getId())
                .forEach(c -> c.setIsPrimary(false));
        }

        EmergencyContact contact = EmergencyContact.builder()
                .user(user)
                .name(request.getName())
                .relationship(request.getRelationship())
                .phoneNumber(request.getPhoneNumber())
                .alternatePhone(request.getAlternatePhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .isPrimary(request.getIsPrimary())
                .priority(request.getPriority() != null ? request.getPriority() : 3)
                .canPickupChild(Boolean.TRUE.equals(request.getCanPickupChild()))
                .notes(request.getNotes())
                .build();

        return EmergencyContactDto.from(repository.save(contact));
    }

    @Transactional(readOnly = true)
    public List<EmergencyContactDto> list() {
        User user = getCurrentUser();
        return repository.findByUserIdAndDeletedAtIsNullOrderByPriorityAsc(user.getId())
                .stream().map(EmergencyContactDto::from).collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        User user = getCurrentUser();
        EmergencyContact c = repository.findById(id)
                .orElseThrow(() -> new ApiException("Contact not found", HttpStatus.NOT_FOUND, "CONTACT_NOT_FOUND"));
        if (!c.getUser().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
        c.softDelete();
        repository.save(c);
    }

    @Transactional
    public EmergencyContactDto update(Long id, EmergencyContactRequest request) {
        User user = getCurrentUser();
        EmergencyContact c = repository.findById(id)
                .orElseThrow(() -> new ApiException("Contact not found", HttpStatus.NOT_FOUND, "CONTACT_NOT_FOUND"));
        if (!c.getUser().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
        c.setName(request.getName());
        c.setRelationship(request.getRelationship());
        c.setPhoneNumber(request.getPhoneNumber());
        c.setAlternatePhone(request.getAlternatePhone());
        c.setEmail(request.getEmail());
        c.setAddress(request.getAddress());
        c.setIsPrimary(request.getIsPrimary());
        c.setPriority(request.getPriority() != null ? request.getPriority() : c.getPriority());
        c.setCanPickupChild(Boolean.TRUE.equals(request.getCanPickupChild()));
        c.setNotes(request.getNotes());
        return EmergencyContactDto.from(repository.save(c));
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
    }
}
