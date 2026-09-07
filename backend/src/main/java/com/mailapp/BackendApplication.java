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
        // Check RAW env vars via System.getenv (not Spring-resolved properties)
        // This tells us whether the vars are actually set on the platform
        String rawDbUrl = System.getenv("DATABASE_URL");
        String rawDbUser = System.getenv("DATABASE_USERNAME");
        String rawDbPass = System.getenv("DATABASE_PASSWORD");
        String rawGoogleId = System.getenv("GOOGLE_CLIENT_ID");
        String rawGoogleSecret = System.getenv("GOOGLE_CLIENT_SECRET");
        String rawFrontendUrl = System.getenv("FRONTEND_URL");

        // Spring-resolved values (may include defaults)
        String clientId = env.getProperty("spring.security.oauth2.client.registration.google.client-id");
        String clientSecret = env.getProperty("spring.security.oauth2.client.registration.google.client-secret");
        String resolvedDbUrl = env.getProperty("spring.datasource.url", "NOT SET");

        log.info("============================================");
        log.info("  STARTUP ENVIRONMENT DIAGNOSTIC");
        log.info("============================================");
        log.info("  RAW env vars (from platform):");
        log.info("    DATABASE_URL      : {}", rawDbUrl != null && !rawDbUrl.isBlank() ? "SET (length=" + rawDbUrl.length() + ")" : "NOT SET");
        log.info("    DATABASE_USERNAME  : {}", rawDbUser != null && !rawDbUser.isBlank() ? "SET" : "NOT SET");
        log.info("    DATABASE_PASSWORD  : {}", rawDbPass != null && !rawDbPass.isBlank() ? "SET" : "NOT SET");
        log.info("    GOOGLE_CLIENT_ID   : {}", rawGoogleId != null && !rawGoogleId.isBlank() ? "SET (length=" + rawGoogleId.length() + ")" : "NOT SET");
        log.info("    GOOGLE_CLIENT_SECRET: {}", rawGoogleSecret != null && !rawGoogleSecret.isBlank() ? "SET (length=" + rawGoogleSecret.length() + ")" : "NOT SET");
        log.info("    FRONTEND_URL       : {}", rawFrontendUrl != null && !rawFrontendUrl.isBlank() ? rawFrontendUrl : "NOT SET");
        log.info("  Spring-resolved properties:");
        log.info("    datasource.url     : {}", resolvedDbUrl);
        log.info("    google.client-id   : {}", clientId == null || clientId.isBlank() ? "MISSING" : "PRESENT (length=" + clientId.length() + ")");
        log.info("    google.client-secret: {}", clientSecret == null || clientSecret.isBlank() ? "MISSING" : "PRESENT (length=" + clientSecret.length() + ")");
        log.info("============================================");

        // Critical checks
        if (rawDbUrl == null || rawDbUrl.isBlank()) {
            log.error("CRITICAL: DATABASE_URL env var is NOT SET on this platform!");
            log.error("The app is using the default: jdbc:postgresql://localhost:5432/postgres");
            log.error("Set DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD in Railway dashboard.");
            log.error("For Supabase: jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require");
        } else if (rawDbUrl.contains("localhost")) {
            log.error("CRITICAL: DATABASE_URL points to localhost — this will NOT work on Railway/production!");
            log.error("Set DATABASE_URL to your Supabase connection string in Railway dashboard.");
        }
        if (rawGoogleId == null || rawGoogleId.isBlank()) {
            log.error("CRITICAL: GOOGLE_CLIENT_ID env var is NOT SET! OAuth will fail with 'invalid_client'.");
        }
        if (rawGoogleSecret == null || rawGoogleSecret.isBlank()) {
            log.error("CRITICAL: GOOGLE_CLIENT_SECRET env var is NOT SET! OAuth will fail with 'invalid_client'.");
        }
        if (rawFrontendUrl == null || rawFrontendUrl.isBlank()) {
            log.error("CRITICAL: FRONTEND_URL env var is NOT SET! Post-login redirect will go to localhost.");
            log.error("Set FRONTEND_URL=https://nebulamail.vercel.app in Railway dashboard.");
        }
        if (clientId != null && clientId.endsWith(".apps.googleusercontent.com")) {
            log.info("  Google Client ID format: looks valid");
        }
    }
}
