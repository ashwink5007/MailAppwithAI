package com.mailapp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

/**
 * Ensures every Set-Cookie header includes SameSite=None.
 *
 * The Spring Boot property {@code server.servlet.session.cookie.same-site=none}
 * does NOT work reliably with embedded Tomcat.  Without an explicit SameSite
 * attribute, the browser treats cookies as SameSite=Lax, which breaks the
 * OAuth2 flow across domains (Vercel → Railway): the JSESSIONID is dropped
 * when the user returns from Google's consent screen, causing a 400 error
 * because the OAuth2AuthorizationRequest is missing from the session.
 *
 * This filter rewrites Set-Cookie headers to add SameSite=None for any cookie
 * that does not already specify a SameSite attribute.
 */
@Configuration
public class SameSiteCookieConfig {

    @Bean
    public OncePerRequestFilter sameSiteFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(
                    jakarta.servlet.http.HttpServletRequest request,
                    jakarta.servlet.http.HttpServletResponse response,
                    FilterChain filterChain) throws ServletException, IOException {

                HttpServletResponseWrapper wrappedResponse =
                        new HttpServletResponseWrapper(response) {
                            @Override
                            public void addHeader(String name, String value) {
                                if ("Set-Cookie".equalsIgnoreCase(name) && value != null
                                        && !value.toLowerCase().contains("samesite=")) {
                                    super.addHeader(name, value + "; SameSite=None");
                                } else {
                                    super.addHeader(name, value);
                                }
                            }

                            @Override
                            public void setHeader(String name, String value) {
                                if ("Set-Cookie".equalsIgnoreCase(name) && value != null
                                        && !value.toLowerCase().contains("samesite=")) {
                                    super.setHeader(name, value + "; SameSite=None");
                                } else {
                                    super.setHeader(name, value);
                                }
                            }
                        };

                filterChain.doFilter(request, wrappedResponse);
            }
        };
    }
}
