package com.mailapp.controller;

import com.mailapp.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health check endpoints.
 * /api/health      — lightweight, no DB check (for Railway healthcheck / uptime monitors)
 * /api/health/ready — deep check including DB connectivity
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Autowired(required = false)
    private DataSource dataSource;

    /**
     * Lightweight health check — always returns 200 if the JVM is up.
     * Used by Railway's healthcheck and uptime monitors.
     */
    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok("Backend is running", Map.of(
                "status", "UP",
                "service", "mailapp-backend"
        ));
    }

    /**
     * Deep health check — verifies DB connectivity.
     * Returns 503 if the database is unreachable.
     */
    @GetMapping("/health/ready")
    public ApiResponse<Map<String, Object>> ready() {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("service", "mailapp-backend");

        // Check database
        if (dataSource == null) {
            details.put("database", "NOT CONFIGURED (no DataSource bean)");
            details.put("status", "DEGRADED");
            return new ApiResponse<>(false, "Database not configured", details);
        }

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            details.put("database", meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion());
            details.put("databaseUrl", meta.getURL());
            details.put("status", "UP");
            return ApiResponse.ok("All systems operational", details);
        } catch (Exception e) {
            details.put("database", "UNREACHABLE: " + e.getMessage());
            details.put("status", "DOWN");
            return new ApiResponse<>(false, "Database connection failed", details);
        }
    }

    /**
     * Diagnostic endpoint — reveals whether critical env vars are resolved.
     * Does NOT expose actual secret values.
     */
    @GetMapping("/debug/oauth-status")
    public Map<String, Object> oauthStatus() {
        String rawDbUrl = System.getenv("DATABASE_URL");
        String rawFrontendUrl = System.getenv("FRONTEND_URL");
        String rawGoogleId = System.getenv("GOOGLE_CLIENT_ID");

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("clientIdResolved", googleClientId != null && !googleClientId.isBlank());
        status.put("clientIdLength", googleClientId != null ? googleClientId.length() : 0);
        status.put("clientIdFormatValid", googleClientId != null && googleClientId.endsWith(".apps.googleusercontent.com"));
        status.put("databaseUrlSet", rawDbUrl != null && !rawDbUrl.isBlank());
        status.put("databaseUrlPointsToLocalhost", rawDbUrl != null && rawDbUrl.contains("localhost"));
        status.put("frontendUrl", rawFrontendUrl != null ? rawFrontendUrl : "NOT SET");
        status.put("redirectUri", "https://mailappwithai.up.railway.app/login/oauth2/code/google");
        return status;
    }

    /**
     * Diagnostic — checks if the users table has the password_hash column.
     */
    @GetMapping("/debug/db-schema")
    public Map<String, Object> dbSchema() {
        Map<String, Object> status = new LinkedHashMap<>();
        if (dataSource == null) {
            status.put("error", "No DataSource configured");
            return status;
        }
        try (Connection conn = dataSource.getConnection()) {
            var rs = conn.createStatement().executeQuery(
                    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
            var columns = new java.util.ArrayList<Map<String, Object>>();
            while (rs.next()) {
                var col = new LinkedHashMap<String, Object>();
                col.put("name", rs.getString("column_name"));
                col.put("type", rs.getString("data_type"));
                col.put("nullable", rs.getString("is_nullable"));
                columns.add(col);
            }
            status.put("table", "users");
            status.put("columns", columns);
            status.put("columnCount", columns.size());

            boolean hasPasswordHash = columns.stream()
                    .anyMatch(c -> "password_hash".equals(c.get("name")));
            boolean googleIdNullable = columns.stream()
                    .filter(c -> "google_id".equals(c.get("name")))
                    .findFirst()
                    .map(c -> "YES".equals(c.get("nullable")))
                    .orElse(false);

            status.put("passwordHashExists", hasPasswordHash);
            status.put("googleIdNullable", googleIdNullable);

            if (!hasPasswordHash) {
                status.put("issue", "password_hash column MISSING — run: ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);");
            } else if (!googleIdNullable) {
                status.put("issue", "google_id is NOT NULL — run: ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;");
            } else {
                status.put("issue", "Schema OK — no issues detected");
            }
        } catch (Exception e) {
            status.put("error", e.getMessage());
        }
        return status;
    }

    /**
     * Safe Gemini diagnostic — reveals whether GEMINI_API_KEY is resolved
     * WITHOUT exposing the actual key value.
     */
    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-3.6-flash}")
    private String geminiModel;

    @GetMapping("/debug/gemini-status")
    public Map<String, Object> geminiStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("apiKeyPresent", geminiApiKey != null && !geminiApiKey.isBlank());
        status.put("apiKeyLength", geminiApiKey != null ? geminiApiKey.length() : 0);
        status.put("model", geminiModel);
        return status;
    }
}
