package com.mailapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Web MVC configuration.
 *
 * Single coherent CORS policy for the whole backend.
 *
 * The allowed origins resolve from {@code cors.allowed-origin} (which defaults
 * to {@code FRONTEND_URL}) plus local-dev defaults. The SAME origin set is
 * exposed as a {@link CorsConfigurationSource} bean so Spring Security's
 * CorsFilter (which runs before the LogoutFilter and the API authorization
 * chain) enforces exactly the same policy as Spring MVC.
 *
 * Credentialed requests (session cookie) always receive the exact requesting
 * origin — never the wildcard "*".
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origin:http://localhost:3000}")
    private String allowedOrigin;

    /**
     * Resolves the effective allowlist: every comma-separated value from
     * configuration plus local-dev and production defaults (deduped, order kept).
     */
    private List<String> resolveAllowedOrigins() {
        Set<String> origins = new LinkedHashSet<>();
        if (allowedOrigin != null) {
            Arrays.stream(allowedOrigin.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(origins::add);
        }
        // Local development defaults — harmless in production.
        origins.add("http://localhost:3000");
        origins.add("http://localhost:5173");
        // Production frontend — kept as a default so a missing FRONTEND_URL
        // env var on Railway can never silently break credentialed CORS.
        origins.add("https://nebulamail.vercel.app");
        return new ArrayList<>(origins);
    }

    /**
     * The ONE CorsConfigurationSource used by Spring Security.
     * Registered for /** so preflight (OPTIONS), /logout, /auth/**,
     * /oauth2/** and /api/** all share the same credentialed policy.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Exact origins only — never "*" combined with allowCredentials(true).
        config.setAllowedOrigins(resolveAllowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Mirror the same origin set at the MVC layer for consistency.
        String[] origins = resolveAllowedOrigins().toArray(new String[0]);

        // API endpoints — credentials required for session cookie
        registry.addMapping("/api/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // OAuth2 endpoints — allow cross-origin preflight checks
        registry.addMapping("/oauth2/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Login callback endpoints (OAuth2 redirect target on the backend)
        registry.addMapping("/login/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Logout endpoint
        registry.addMapping("/logout")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Auth endpoints (register, login, etc.)
        registry.addMapping("/auth/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
