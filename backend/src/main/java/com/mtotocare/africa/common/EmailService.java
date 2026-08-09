package com.mtotocare.africa.common;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Sends real emails. Two modes:
 *
 * 1. SANDBOX (default in dev) — when sandbox-mode = true OR no GMAIL_USER is set:
 *    Writes a .eml file to ./eml-outbox/YYYY-MM-DD/HH-mm-ss_to@address.eml
 *    Open it in Outlook/Thunderbird to preview.
 *
 * 2. REAL GMAIL SMTP — when sandbox-mode = false and GMAIL_USER + GMAIL_APP_PASSWORD are set:
 *    Sends via smtp.gmail.com:587 using JavaMailSender. Email lands in the recipient's real inbox.
 *
 * To get a Gmail App Password:
 *   1. Enable 2-Step Verification: https://myaccount.google.com/security
 *   2. Create App Password: https://myaccount.google.com/apppasswords
 *   3. Use that 16-char password as GMAIL_APP_PASSWORD
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailProperties props;
    private final JavaMailSender mailSender; // null in sandbox mode if not configured, but Spring Boot autowires it

    // We read the raw env vars here because EmailProperties is for the things
    // the application code uses. The actual mail-sending uses Spring's JavaMailSender.
    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    @PostConstruct
    public void init() {
        // Auto-fallback to sandbox if Gmail creds are missing
        if (!props.isSandboxMode() && (smtpUsername == null || smtpUsername.isBlank() || smtpPassword == null || smtpPassword.isBlank())) {
            log.warn("EMAIL_SANDBOX=false but GMAIL_USER / GMAIL_APP_PASSWORD is blank — falling back to SANDBOX mode.");
            props.setSandboxMode(true);
        }

        if (props.isSandboxMode()) {
            log.warn("=========================================================");
            log.warn("EMAIL IS IN SANDBOX MODE.");
            log.warn("Emails will be written to: ./eml-outbox/");
            log.warn("To send REAL emails, set in env:");
            log.warn("  EMAIL_SANDBOX=false");
            log.warn("  GMAIL_USER=your.email@gmail.com");
            log.warn("  GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx");
            log.warn("=========================================================");
        } else {
            log.info("Email service: REAL Gmail SMTP mode. From: {} <{}>",
                    props.getFromName(), props.getFromAddress());
        }
    }

    /**
     * Send an HTML email. Returns true on success.
     */
    public boolean send(String to, String subject, String htmlBody) {
        return send(to, subject, htmlBody, null);
    }

    public boolean send(String to, String subject, String htmlBody, String textBody) {
        if (to == null || to.isBlank()) {
            log.warn("Refusing to send email: recipient address is blank");
            return false;
        }
        if (subject == null) subject = "(no subject)";
        if (textBody == null) textBody = stripHtml(htmlBody);

        if (props.isSandboxMode()) {
            return writeEmlToDisk(to, subject, htmlBody, textBody);
        }
        return sendViaSmtp(to, subject, htmlBody, textBody);
    }

    // =========== REAL Gmail SMTP ===========

    private boolean sendViaSmtp(String to, String subject, String htmlBody, String textBody) {
        if (mailSender == null) {
            log.error("JavaMailSender is not available. Did you forget spring-boot-starter-mail?");
            return false;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // multipart=true, encoding=UTF-8
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(props.getFromAddress(), props.getFromName());
            helper.setTo(to);
            if (props.getReplyToAddress() != null && !props.getReplyToAddress().isBlank()) {
                helper.setReplyTo(props.getReplyToAddress());
            }
            helper.setSubject(subject);
            // Set the HTML body. Setting text too so non-HTML clients see something.
            helper.setText(textBody, htmlBody);

            mailSender.send(message);
            log.info("Email SENT via Gmail SMTP to {} (subject: \"{}\")", to, subject);
            return true;
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Gmail SMTP send failed for {}: {}", to, e.getMessage(), e);
            return false;
        } catch (Exception e) {
            log.error("Gmail SMTP send failed for {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    // =========== Sandbox (writes .eml to disk) ===========

    private boolean writeEmlToDisk(String to, String subject, String html, String text) {
        try {
            String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH-mm-ss-SSS"));
            String safeTo = to.replaceAll("[^A-Za-z0-9._@-]", "_");
            String day = LocalDateTime.now().toLocalDate().toString();
            Path dir = Paths.get("eml-outbox", day);
            Files.createDirectories(dir);
            Path file = dir.resolve(ts + "_" + safeTo + ".eml");

            String eml = buildEml(to, subject, html, text);
            Files.write(file, eml.getBytes(StandardCharsets.UTF_8));
            log.info("[SANDBOX] Email written to {} (to={}, subject=\"{}\")", file, to, subject);
            return true;
        } catch (IOException e) {
            log.error("Failed to write .eml to disk", e);
            return false;
        }
    }

    private String buildEml(String to, String subject, String html, String text) {
        String boundary = "----=_NextPart_" + System.currentTimeMillis();
        String from = props.getFromName() + " <" + props.getFromAddress() + ">";
        return new StringBuilder()
                .append("From: ").append(from).append("\r\n")
                .append("To: ").append(to).append("\r\n")
                .append("Subject: ").append(subject).append("\r\n")
                .append("Date: ").append(DateTimeFormatter.RFC_1123_DATE_TIME.format(java.time.ZonedDateTime.now())).append("\r\n")
                .append("MIME-Version: 1.0\r\n")
                .append("Content-Type: multipart/alternative; boundary=\"").append(boundary).append("\"\r\n")
                .append("\r\n")
                .append("--").append(boundary).append("\r\n")
                .append("Content-Type: text/plain; charset=UTF-8\r\n")
                .append("Content-Transfer-Encoding: quoted-printable\r\n\r\n")
                .append(text).append("\r\n\r\n")
                .append("--").append(boundary).append("\r\n")
                .append("Content-Type: text/html; charset=UTF-8\r\n")
                .append("Content-Transfer-Encoding: quoted-printable\r\n\r\n")
                .append(html).append("\r\n\r\n")
                .append("--").append(boundary).append("--\r\n")
                .toString();
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
    }
}
