package com.mailapp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Ensures cross-origin session cookies survive Vercel → Railway requests.
 *
 * WHY THIS IS NEEDED:
 * In production, the frontend (Vercel) and backend (Railway) are on different
 * domains. The browser requires SameSite=None + Secure for cross-origin cookie
 * storage/sending. Without it, the browser defaults to SameSite=Lax, which
 * blocks the session cookie on cross-origin fetch requests (e.g. POST
 * /api/ai/command), producing a 401 even though /auth/login succeeded.
 *
 * LOCAL DEV SAFETY:
 * Secure cookies are never sent over plain http://localhost. The filter only
 * forces SameSite=None + Secure when the incoming request is actually secure
 * (https or X-Forwarded-Proto: https behind Railway's proxy). Plain-http local
 * requests keep the container default (Lax) so localhost login still persists.
 *
 * WHY addCookie() MUST BE OVERRIDDEN:
 * Tomcat's session cookie (JSESSIONID) is set via Response.addCookie(), which
 * internally calls this.addHeader() on the ORIGINAL Response object — bypassing
 * our wrapper's addHeader() override entirely. Overriding addCookie() is the
 * only way to intercept Tomcat's session cookie.
 *
 * CRITICAL ORDERING: This filter MUST run BEFORE Spring Security's
 * FilterChainProxy (order -100). Registered via FilterRegistrationBean
 * with HIGHEST_PRECEDENCE + 100 to guarantee execution before Spring Security.
 */
@Configuration
public class SameSiteCookieConfig {

    private static boolean isSecureRequest(jakarta.servlet.http.HttpServletRequest request) {
        if (request.isSecure()) {
            return true;
        }
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        return forwardedProto != null && forwardedProto.toLowerCase().contains("https");
    }

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

                            /**
                             * CRITICAL: This is how Tomcat sets the JSESSIONID session cookie.
                             * Response.addCookie() internally calls this.addHeader() on the
                             * ORIGINAL response, bypassing our addHeader() override.
                             * We MUST override addCookie() to intercept session cookies.
                             */
                            @Override
                            public void addCookie(Cookie cookie) {
                                if (cookie != null && isSecureRequest(request)) {
                                    cookie.setAttribute("SameSite", "None");
                                    cookie.setSecure(true);
                                    cookie.setHttpOnly(true);
                                    if (cookie.getPath() == null || cookie.getPath().isBlank()) {
                                        cookie.setPath("/");
                                    }
                                }
                                super.addCookie(cookie);
                            }

                            @Override
                            public void addHeader(String name, String value) {
                                if ("Set-Cookie".equalsIgnoreCase(name) && value != null
                                        && !value.toLowerCase().contains("samesite=")
                                        && isSecureRequest(request)) {
                                    if (!value.toLowerCase().contains("secure")) {
                                        value = value + "; Secure";
                                    }
                                    super.addHeader(name, value + "; SameSite=None");
                                } else {
                                    super.addHeader(name, value);
                                }
                            }

                            @Override
                            public void setHeader(String name, String value) {
                                if ("Set-Cookie".equalsIgnoreCase(name) && value != null
                                        && !value.toLowerCase().contains("samesite=")
                                        && isSecureRequest(request)) {
                                    if (!value.toLowerCase().contains("secure")) {
                                        value = value + "; Secure";
                                    }
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
