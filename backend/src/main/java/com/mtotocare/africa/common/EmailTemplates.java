package com.mtotocare.africa.common;

import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * HTML email templates. Bilingual: 'en' and 'sw' (Kiswahili).
 * The language is chosen by the user's preferredLanguage field at send time.
 */
public final class EmailTemplates {

    private EmailTemplates() {}

    private static String wrap(String title, String body, String lang) {
        String appName = "sw".equals(lang) ? "MtotoCare Afrika" : "MtotoCare Africa";
        String tagline = "sw".equals(lang) ? "Watoto wenye afya, Afrika yenye afya" : "Healthy children, healthy Africa";
        String help = "sw".equals(lang)
                ? "Unahitaji msaada? Jibu barua hii au wasiliana nasi support@mtotocare.africa"
                : "Need help? Reply to this email or contact support@mtotocare.africa";
        String year = String.valueOf(LocalDateTime.now().getYear());
        String sent = "sw".equals(lang) ? "Imetumwa" : "Sent at";

        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>" + title + "</title></head>" +
                "<body style=\"margin:0;padding:0;background:#f4f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a2e1f;\">" +
                "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background:#f4f7f5;padding:24px 0;\">" +
                "<tr><td align=\"center\">" +
                "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);\">" +
                "<tr><td style=\"background:#0f9d58;padding:24px;text-align:center;\">" +
                "<h1 style=\"margin:0;color:#ffffff;font-size:22px;font-weight:700;\">" + appName + "</h1>" +
                "<p style=\"margin:6px 0 0;color:#d4f5e2;font-size:13px;\">" + tagline + "</p>" +
                "</td></tr>" +
                "<tr><td style=\"padding:32px 28px;\">" + body + "</td></tr>" +
                "<tr><td style=\"background:#f4f7f5;padding:20px 28px;text-align:center;\">" +
                "<p style=\"margin:0;font-size:12px;color:#6b7a70;\">" + help + "</p>" +
                "<p style=\"margin:8px 0 0;font-size:11px;color:#9ba8a0;\">© " + year + " " + appName + ". " + sent + " " +
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'").format(LocalDateTime.now(ZoneOffset.UTC)) +
                "</p></td></tr>" +
                "</table></td></tr></table></body></html>";
    }

    /**
     * Password reset email. The link goes to the mobile app's deep link
     * mtotocare://reset-password?token=... (handled by Expo Router)
     */
    public static String passwordReset(String fullName, String token, String appBaseUrl, String lang) {
        boolean sw = "sw".equals(lang);
        String webLink = appBaseUrl + "/reset-password?token=" + token;
        String deepLink = "mtotocare://reset-password?token=" + token;

        String greeting = sw
                ? (fullName == null || fullName.isBlank() ? "Habari," : "Habari " + escape(fullName) + ",")
                : (fullName == null || fullName.isBlank() ? "Hello," : "Hello " + escape(fullName) + ",");

        String title = sw ? "Rudisha nenosiri lako" : "Reset your password";
        String body1 = sw
                ? "Tumepokea ombi la kurejesha nenosiri la akaunti yako ya MtotoCare Afrika. " +
                  "Bofya kitufe hapa chini kwenye simu yako ili uweke nenosiri jipya. Kiungo hiki kinamalizika baada ya saa 1."
                : "We received a request to reset the password for your MtotoCare Africa account. " +
                  "Tap the button below on your phone to set a new password. The link expires in 1 hour.";

        String button = sw ? "Rudisha Nenosiri Langu" : "Reset My Password";
        String ifNotWork = sw
                ? "Kama kitufe hakifanyi kazi, nakili kiungo hiki kwenye kivinjari chako:"
                : "If the button doesn't work, copy this link into your browser:";
        String orWeb = sw ? "Au tumia kiungo hiki cha wavuti:" : "Or use this web link:";
        String didntRequest = sw
                ? "<strong style=\"color:#1a2e1f;\">Hukuomba hili?</strong> Unaweza kupuuza barua hii kwa usalama. Nenosiri lako halitabadilika."
                : "<strong style=\"color:#1a2e1f;\">Didn't request this?</strong> You can safely ignore this email. Your password will remain unchanged.";

        String body =
            "<h2 style=\"margin:0 0 16px;font-size:20px;color:#1a2e1f;\">" + title + "</h2>" +
            "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.55;\">" + greeting + "</p>" +
            "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.55;\">" + body1 + "</p>" +
            "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:24px 0;width:100%;\">" +
            "<tr><td align=\"center\">" +
            "<a href=\"" + deepLink + "\" style=\"display:inline-block;background:#0f9d58;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;\">" +
            button +
            "</a></td></tr></table>" +
            "<p style=\"margin:16px 0 8px;font-size:13px;color:#6b7a70;\">" + ifNotWork + "</p>" +
            "<p style=\"margin:0;padding:12px;background:#f4f7f5;border-radius:6px;word-break:break-all;font-size:12px;color:#1a2e1f;\">" +
            escape(deepLink) +
            "</p>" +
            "<p style=\"margin:24px 0 8px;font-size:13px;color:#6b7a70;\">" + orWeb + " " +
            "<a href=\"" + webLink + "\" style=\"color:#0f9d58;\">" + escape(webLink) + "</a>" +
            "</p>" +
            "<hr style=\"border:none;border-top:1px solid #e5ebe7;margin:24px 0;\">" +
            "<p style=\"margin:0;font-size:13px;color:#6b7a70;line-height:1.55;\">" + didntRequest + "</p>";
        return wrap(title, body, lang);
    }

    /**
     * Welcome email sent at registration. Tells the user their account is ready
     * and shows the seed data (no verification step required in this iteration).
     */
    public static String welcome(String fullName, String appBaseUrl, String lang) {
        boolean sw = "sw".equals(lang);
        String greeting = sw
                ? (fullName == null || fullName.isBlank() ? "Karibu," : "Karibu " + escape(fullName) + ",")
                : (fullName == null || fullName.isBlank() ? "Welcome," : "Welcome " + escape(fullName) + ",");
        String title = sw ? "Akaunti yako iko tayari" : "Your account is ready";
        String body1 = sw
                ? "Asante kwa kujiunga na MtotoCare Afrika. Sasa unaweza kufuatilia chanjo, ukuaji, lishe ya watoto wako, " +
                  "na kuweka miadi na watoa huduma wa afya kote Tanzania."
                : "Thank you for joining MtotoCare Africa. You can now track your children's " +
                  "vaccinations, growth, nutrition, and book appointments with healthcare workers " +
                  "across Tanzania.";
        String button = sw ? "Fungua MtotoCare" : "Open MtotoCare";
        String steps = sw ? "Hatua zinazofuata:" : "Next steps:";
        String step1 = sw ? "Ongeza mtoto wako wa kwanza kwenye programu ya simu" : "Add your first child in the mobile app";
        String step2 = sw ? "Weka vikumbusho vya chanjo" : "Set up vaccination reminders";
        String step3 = sw ? "Weka miadi yako ya kwanza na daktari" : "Book your first appointment with a doctor";

        String body =
            "<h2 style=\"margin:0 0 16px;font-size:20px;color:#1a2e1f;\">" + title + "</h2>" +
            "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.55;\">" + greeting + "</p>" +
            "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.55;\">" + body1 + "</p>" +
            "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:24px 0;width:100%;\">" +
            "<tr><td align=\"center\">" +
            "<a href=\"" + appBaseUrl + "\" style=\"display:inline-block;background:#0f9d58;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;\">" +
            button +
            "</a></td></tr></table>" +
            "<p style=\"margin:16px 0 8px;font-size:13px;color:#6b7a70;line-height:1.55;\">" + steps + "</p>" +
            "<ul style=\"margin:0 0 16px;padding-left:20px;font-size:14px;color:#1a2e1f;line-height:1.7;\">" +
            "<li>" + step1 + "</li>" +
            "<li>" + step2 + "</li>" +
            "<li>" + step3 + "</li>" +
            "</ul>";
        return wrap(title, body, lang);
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
