package com.mtotocare.africa.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Render (and several other hosts — Heroku, Railway, etc.) hand you a
 * database connection string in "raw" URL form:
 *
 *     postgresql://user:password@host:5432/dbname
 *
 * That is NOT a valid JDBC URL — JDBC needs "jdbc:postgresql://host:5432/dbname"
 * with the credentials passed separately, not embedded in the URL. Pasting
 * the raw form directly into DB_URL fails at startup with an opaque error
 * ("Driver ... claims to not accept jdbcUrl ..."), which is exactly what
 * happens if someone copies Render's "Internal Database URL" as-is.
 *
 * This runs before Spring's datasource auto-configuration reads any
 * properties, and — only if DB_URL/DATABASE_URL looks like a raw
 * postgresql://, postgres://, or mysql:// URL rather than an already-valid
 * jdbc: URL — rewrites it into spring.datasource.url/username/password so
 * the app boots correctly either way, without anyone needing to hand-build
 * a JDBC URL.
 */
public class RenderDatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = firstNonBlank(
                environment.getProperty("DB_URL"),
                environment.getProperty("DATABASE_URL"));
        if (raw == null || raw.isBlank() || raw.startsWith("jdbc:")) {
            return; // nothing to do — already a proper JDBC URL, or not set (falls back to the yml default)
        }

        try {
            URI uri = new URI(raw);
            String scheme = uri.getScheme();
            if (scheme == null) return;

            String jdbcSubprotocol;
            switch (scheme) {
                case "postgres":
                case "postgresql":
                    jdbcSubprotocol = "postgresql";
                    break;
                case "mysql":
                    jdbcSubprotocol = "mysql";
                    break;
                default:
                    return; // unrecognized scheme — leave it alone, let Spring's normal error surface if it's actually wrong
            }

            String userInfo = uri.getUserInfo();
            String username = null;
            String password = null;
            if (userInfo != null && userInfo.contains(":")) {
                int idx = userInfo.indexOf(':');
                username = userInfo.substring(0, idx);
                password = userInfo.substring(idx + 1);
            } else if (userInfo != null) {
                username = userInfo;
            }

            int port = uri.getPort();
            String hostPort = uri.getHost() + (port > 0 ? ":" + port : "");
            String path = uri.getPath() == null ? "" : uri.getPath(); // includes leading "/dbname"
            String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";

            String jdbcUrl = "jdbc:" + jdbcSubprotocol + "://" + hostPort + path + query;

            Map<String, Object> overrides = new LinkedHashMap<>();
            overrides.put("spring.datasource.url", jdbcUrl);
            if (username != null) overrides.put("spring.datasource.username", username);
            if (password != null) overrides.put("spring.datasource.password", password);

            environment.getPropertySources().addFirst(
                    new MapPropertySource("renderDatabaseUrlOverride", overrides));
        } catch (URISyntaxException e) {
            // Leave it alone — malformed either way, let the real datasource
            // error surface rather than masking it with a confusing one here.
        }
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
