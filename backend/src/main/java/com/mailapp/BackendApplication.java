package com.mailapp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BackendApplication.class);

    private final Environment env;

    public BackendApplication(Environment env) {
        this.env = env;
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Override
    public void run(String... args) {
        String clientId = env.getProperty("spring.security.oauth2.client.registration.google.client-id");
        String clientSecret = env.getProperty("spring.security.oauth2.client.registration.google.client-secret");
        String frontendUrl = env.getProperty("frontend.url", "NOT SET");
        String dbUrl = env.getProperty("spring.datasource.url", "NOT SET");

        log.info("========================================");
        log.info("  OAUTH2 CONFIGURATION DIAGNOSTIC");
        log.info("========================================");
        log.info("  GOOGLE_CLIENT_ID resolved: {}", clientId == null || clientId.isBlank() ? "MISSING / EMPTY" : "PRESENT (length=" + clientId.length() + ")");
        log.info("  GOOGLE_CLIENT_SECRET resolved: {}", clientSecret == null || clientSecret.isBlank() ? "MISSING / EMPTY" : "PRESENT (length=" + clientSecret.length() + ")");
        log.info("  FRONTEND_URL: {}", frontendUrl);
        log.info("  DATABASE_URL resolved: {}", dbUrl == null || dbUrl.isBlank() ? "MISSING / EMPTY" : "PRESENT");
        log.info("  forward-headers-strategy: native");
        log.info("========================================");

        if (clientId == null || clientId.isBlank()) {
            log.error("CRITICAL: GOOGLE_CLIENT_ID is not set! OAuth will fail with 'invalid_client'.");
            log.error("Set GOOGLE_CLIENT_ID as an environment variable in Railway dashboard.");
        }
        if (clientSecret == null || clientSecret.isBlank()) {
            log.error("CRITICAL: GOOGLE_CLIENT_SECRET is not set! OAuth will fail with 'invalid_client'.");
            log.error("Set GOOGLE_CLIENT_SECRET as an environment variable in Railway dashboard.");
        }
        if (clientId != null && !clientId.isBlank() && clientId.endsWith(".apps.googleusercontent.com")) {
            log.info("  Client ID format looks valid (ends with .apps.googleusercontent.com)");
        } else if (clientId != null && !clientId.isBlank()) {
            log.warn("  WARNING: Client ID does NOT end with .apps.googleusercontent.com — may be wrong value!");
        }
    }
}
