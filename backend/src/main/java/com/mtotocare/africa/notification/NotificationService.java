package com.mtotocare.africa.notification;

import com.mtotocare.africa.vaccination.Vaccination;
import com.mtotocare.africa.vaccination.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final VaccinationRepository vaccinationRepository;

    @Transactional
    public Notification create(Notification notification) {
        notification.setStatus("PENDING");
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification createVaccinationReminder(Vaccination vaccination) {
        String title = "Vaccination Due";
        String message = String.format("%s is due on %s for %s",
                vaccination.getVaccineName(),
                vaccination.getNextDoseDue(),
                vaccination.getChild() != null ? vaccination.getChild().getFullName() : "your child");
        Notification n = Notification.builder()
                .userId(vaccination.getChild() != null ? vaccination.getChild().getParent().getId() : null)
                .type("VACCINATION")
                .title(title)
                .message(message)
                .relatedEntityType("vaccination")
                .relatedEntityId(vaccination.getId())
                .channel("IN_APP")
                .build();
        return notificationRepository.save(n);
    }

    @Transactional
    public Notification createAppointmentReminder(Long userId, String title, String message, Long appointmentId) {
        Notification n = Notification.builder()
                .userId(userId)
                .type("APPOINTMENT")
                .title(title)
                .message(message)
                .relatedEntityType("appointment")
                .relatedEntityId(appointmentId)
                .channel("IN_APP")
                .build();
        return notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<Notification> getForUser(Long userId) {
        return notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Paginated version — the mobile client's getAll(page, size) expects a
     * {content, totalElements, ...} shape, not a raw array. Previously the
     * controller returned a plain List here, so the mobile app's
     * `res.data.data?.content` was always undefined and notifications never
     * actually rendered.
     */
    @Transactional(readOnly = true)
    public com.mtotocare.africa.common.PageResponse<Notification> getForUserPaged(Long userId, int page, int size) {
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(Math.max(0, page), Math.max(1, size));
        org.springframework.data.domain.Page<Notification> result =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return new com.mtotocare.africa.common.PageResponse<>(
                result.getContent(), (int) result.getTotalElements(),
                result.getTotalPages(), result.getSize(), result.getNumber());
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadForUser(Long userId) {
        return notificationRepository.findByUserIdAndReadAtIsNull(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        if (n.getReadAt() == null) n.setReadAt(LocalDateTime.now());
        return notificationRepository.save(n);
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    /**
     * Daily job: send vaccination reminders for due-soon vaccines
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendDailyReminders() {
        log.info("Running daily vaccination reminder check...");
        LocalDate today = LocalDate.now();
        LocalDate oneWeekFromNow = today.plusDays(7);
        List<Vaccination> dueSoon = vaccinationRepository.findAll().stream()
                .filter(v -> "PENDING".equals(v.getStatus()))
                .filter(v -> v.getNextDoseDue() != null)
                .filter(v -> !v.getNextDoseDue().isAfter(oneWeekFromNow))
                .toList();
        for (Vaccination v : dueSoon) {
            createVaccinationReminder(v);
        }
        log.info("Sent {} vaccination reminders", dueSoon.size());
    }
}
