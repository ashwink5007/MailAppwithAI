package com.mailapp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.io.IOException;
import java.util.Map;

/**
 * Spring Security configuration for Gmail OAuth2 integration.
 *
 * Key decisions:
 * - OAuth2 login redirects browser to Google consent screen.
 * - On success, browser is sent back to the Next.js frontend.
 * - API endpoints (e.g., /api/emails) return 401 JSON (not 302 redirect)
 *   so the frontend can handle unauthenticated state gracefully.
 * - /api/health and /api/user/me are public (used to check auth status).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Apply CORS config from WebConfig
            .cors(cors -> cors.configure(http))

            // CSRF is disabled — we rely on session cookies + CORS allowlist
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(authz -> authz
                // Public endpoints — health check and user status
                .requestMatchers("/api/health", "/api/user/me", "/api/users/me").permitAll()
                // All other /api/** require OAuth2 login
                .anyRequest().authenticated()
            )

            // When an unauthenticated request hits a protected /api/** endpoint,
            // return 401 JSON instead of redirecting to Google login.
            // This allows the frontend to handle the state (e.g., show login page).
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(apiAuthenticationEntryPoint())
            )

            .oauth2Login(oauth2 -> oauth2
                // After successful Google login, redirect back to the Next.js app.
                // The ?login=success param lets the frontend know to re-check the session.
                .defaultSuccessUrl("http://localhost:3000/?login=success", true)
            )

            // Spring Security's built-in logout endpoint: GET /logout
            .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:3000/?logout=success")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }

    /**
     * Returns a 401 JSON response for unauthenticated API requests.
     * Prevents Spring Security from issuing a 302 redirect to Google's login
     * when the frontend calls /api/emails without a valid session.
     */
    @Bean
    public AuthenticationEntryPoint apiAuthenticationEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String body = new ObjectMapper().writeValueAsString(
                Map.of(
                    "success", false,
                    "message", "Not authenticated. Please login via Google OAuth.",
                    "data", (Object) null
                )
            );
            response.getWriter().write(body);
        };
    }
}
