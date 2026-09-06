package com.mailapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration.
 *
 * Configures CORS to allow the Next.js frontend to communicate with the backend.
 * The allowed origin is configurable via application.properties:
 *   cors.allowed-origin=http://localhost:3000
 *
 * Allowed methods cover all standard REST operations needed now and in the future.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origin:http://localhost:3000}")
    private String allowedOrigin;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // API endpoints — credentials required for session cookie
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigin, "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // OAuth2 endpoints — allow cross-origin preflight checks
        registry.addMapping("/oauth2/**")
                .allowedOrigins(allowedOrigin, "http://localhost:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Logout endpoint
        registry.addMapping("/logout")
                .allowedOrigins(allowedOrigin, "http://localhost:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
