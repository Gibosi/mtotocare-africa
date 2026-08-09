package com.mtotocare.africa.common;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Email configuration. Reads from application.yml under "mtotocare.email".
 *
 * Two modes:
 *  - SANDBOX: emails are written to ./eml-outbox/ as .eml files (default)
 *  - GMAIL:   real SMTP via GMAIL_USER + GMAIL_APP_PASSWORD env vars
 *
 * Set EMAIL_SANDBOX=false to enable real sending.
 *
 * Gmail App Password: https://myaccount.google.com/apppasswords
 */
@Data
@Component
@ConfigurationProperties(prefix = "mtotocare.email")
public class EmailProperties {
    /** Sender address (must be the Gmail address you auth as). */
    private String fromAddress = "noreply@mtotocare.africa";

    /** Display name shown in the inbox. */
    private String fromName = "MtotoCare Africa";

    /** Reply-to address (optional, falls back to fromAddress). */
    private String replyToAddress;

    /** Public URL of the app — used to build links in emails (reset password, etc). */
    private String appBaseUrl = "http://localhost:8081";

    /**
     * If true, never actually call Gmail — write the .eml contents to disk
     * under ./eml-outbox/ for local debugging. Auto-enabled when GMAIL_USER is blank.
     */
    private boolean sandboxMode = true;

    public boolean isSandboxMode() {
        return sandboxMode;
    }

    public void setSandboxMode(boolean sandboxMode) {
        this.sandboxMode = sandboxMode;
    }
}
