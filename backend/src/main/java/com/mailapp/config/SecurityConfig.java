package com.mailapp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Spring Security configuration for Gmail OAuth2 integration.
 *
 * Key decisions:
 * - OAuth2 login redirects browser to Google consent screen.
 * - On success, browser is sent back to the Next.js frontend.
 * - API endpoints (e.g., /api/emails) return 401 JSON (not 302 redirect)
 * so the frontend can handle unauthenticated state gracefully.
 * - /api/health and /api/user/me are public (used to check auth status).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Apply CORS config from WebConfig
                .cors(cors -> cors.configure(http))

                // CSRF is disabled — we rely on session cookies + CORS allowlist
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(authz -> authz
                        // Public endpoints — health check, user status, and OAuth diagnostic
                        .requestMatchers("/api/health", "/api/user/me", "/api/users/me", "/api/debug/oauth-status").permitAll()
                        // All other /api/** require OAuth2 login
                        .anyRequest().authenticated())

                // When an unauthenticated request hits a protected /api/** endpoint,
                // return 401 JSON instead of redirecting to Google login.
                // This allows the frontend to handle the state (e.g., show login page).
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(apiAuthenticationEntryPoint()))

                .oauth2Login(oauth2 -> oauth2
                        // After successful Google login, redirect back to the Next.js app.
                        // The ?login=success param lets the frontend know to re-check the session.
                        .defaultSuccessUrl(frontendUrl + "/?login=success", true))

                // Spring Security's built-in logout endpoint: POST /logout
                // Note: The frontend sends POST requests for logout (Spring Security 6+ default)
                .logout(logout -> logout
                        .logoutSuccessUrl(frontendUrl + "/?logout=success")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID"));

        return http.build();
    }

    /**
     * Returns a 401 JSON response for unauthenticated API requests.
     * Prevents Spring Security from issuing a 302 redirect to Google login
     * when the frontend calls /api/emails without a valid session.
     *
     * For non-API paths (e.g. browser navigation to /dashboard), delegates to
     * the default OAuth2 redirect so the user is sent to Google's consent screen.
     */
    @Bean
    public AuthenticationEntryPoint apiAuthenticationEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) -> {
            String uri = request.getRequestURI();
            if (uri.startsWith("/api/")) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                Map<String, Object> errorResponse = new LinkedHashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Not authenticated. Please login via Google OAuth.");
                errorResponse.put("data", null);
                String body = new ObjectMapper().writeValueAsString(errorResponse);
                response.getWriter().write(body);
            } else {
                // Non-API path — redirect to Google OAuth so browser users are not
                // stuck with a raw JSON error page.
                response.sendRedirect(request.getContextPath() + "/oauth2/authorization/google");
            }
        };
    }
}
