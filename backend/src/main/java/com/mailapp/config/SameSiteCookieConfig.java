package com.mailapp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Ensures every Set-Cookie header includes SameSite=None.
 *
 * CRITICAL ORDERING: This filter MUST run BEFORE Spring Security's
 * FilterChainProxy (order -100). If it runs after, Spring Security
 * sets the JSESSIONID cookie on the original (unwrapped) response
 * before our wrapper intercepts it, and the cookie is sent without
 * SameSite=None. The browser then defaults to SameSite=Lax, which
 * blocks the cookie on cross-origin fetch requests from Vercel to
 * Railway, causing the frontend to never recognize the session.
 *
 * Registered via FilterRegistrationBean with HIGHEST_PRECEDENCE + 100
 * to guarantee execution before Spring Security.
 */
@Configuration
public class SameSiteCookieConfig {

    @Bean
    public FilterRegistrationBean<jakarta.servlet.Filter> sameSiteFilterRegistration() {
        jakarta.servlet.Filter filter = new OncePerRequestFilter() {
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

        FilterRegistrationBean<jakarta.servlet.Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 100);
        return registration;
    }
}
