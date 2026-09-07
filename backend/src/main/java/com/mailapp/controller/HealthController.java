package com.mailapp.controller;

import com.mailapp.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health check endpoint.
 * Used by the frontend to verify backend connectivity.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok("Backend is running", Map.of(
                "status", "UP",
                "service", "mailapp-backend",
                "sprint", "3.1"
        ));
    }

    /**
     * Diagnostic endpoint — reveals whether critical env vars are resolved.
     * Does NOT expose actual secret values.
     */
    @GetMapping("/debug/oauth-status")
    public Map<String, Object> oauthStatus() {
        // Check raw env vars
        String rawDbUrl = System.getenv("DATABASE_URL");
        String rawFrontendUrl = System.getenv("FRONTEND_URL");

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("clientIdResolved", googleClientId != null && !googleClientId.isBlank());
        status.put("clientIdLength", googleClientId != null ? googleClientId.length() : 0);
        status.put("clientIdFormatValid", googleClientId != null && googleClientId.endsWith(".apps.googleusercontent.com"));
        status.put("clientSecretResolved", googleClientSecret != null && !googleClientSecret.isBlank());
        status.put("clientSecretLength", googleClientSecret != null ? googleClientSecret.length() : 0);
        status.put("databaseUrlSet", rawDbUrl != null && !rawDbUrl.isBlank());
        status.put("databaseUrlPointsToLocalhost", rawDbUrl != null && rawDbUrl.contains("localhost"));
        status.put("frontendUrl", rawFrontendUrl != null ? rawFrontendUrl : "NOT SET (using fallback)");
        status.put("redirectUri", "https://mailappwithai.up.railway.app/login/oauth2/code/google");
        status.put("authorizationEndpoint", "https://mailappwithai.up.railway.app/oauth2/authorization/google");
        return status;
    }
}
