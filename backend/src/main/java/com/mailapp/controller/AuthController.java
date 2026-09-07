package com.mailapp.controller;

import com.mailapp.dto.ApiResponse;
import com.mailapp.dto.LoginRequest;
import com.mailapp.dto.RegisterRequest;
import com.mailapp.entity.User;
import com.mailapp.repository.UserRepository;
import com.mailapp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    /**
     * Framework-blessed store for the programmatic email/password login below.
     * Uses the exact key/format that SecurityContextHolderFilter reads back on
     * the next request — never a hand-rolled session attribute that can drift.
     */
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @RequestBody @Valid RegisterRequest request) {
        try {
            String email = request.email().trim().toLowerCase();

            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.ok(ApiResponse.error("An account with this email already exists."));
            }

            User user = User.builder()
                    .email(email)
                    .name(request.displayName().trim())
                    .passwordHash(passwordEncoder.encode(request.password()))
                    .build();

            User saved = userRepository.save(user);
            log.info("New user registered: {}", email);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", saved.getId());
            data.put("email", saved.getEmail());
            data.put("displayName", saved.getName());
            data.put("googleConnected", saved.getGoogleId() != null);
            data.put("mailboxMode", saved.getGoogleId() != null ? "REAL_GMAIL" : "DEMO");

            return ResponseEntity.ok(ApiResponse.ok("Registration successful", data));
        } catch (Exception e) {
            String msg = e.getMessage();
            Throwable cause = e.getCause();
            while (cause != null) {
                if (cause.getMessage() != null) msg = cause.getMessage();
                cause = cause.getCause();
            }
            log.error("Registration failed: {}", msg, e);
            return ResponseEntity.ok(ApiResponse.error("Registration failed: " +
                    (msg != null ? msg.substring(0, Math.min(msg.length(), 200)) : "unknown error")));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        try {
            String email = request.email().trim().toLowerCase();

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("Invalid email or password."));
            }

            User user = userOpt.get();

            if (user.getPasswordHash() == null) {
                return ResponseEntity.ok(ApiResponse.error(
                        "This account uses Google sign-in. Please continue with Google."));
            }

            if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                return ResponseEntity.ok(ApiResponse.error("Invalid email or password."));
            }

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER")));

            // Persist via the SecurityContextRepository (same store the
            // SecurityContextHolderFilter loads on subsequent requests) and
            // ensure a session exists so the JSESSIONID cookie is issued.
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            httpRequest.getSession(true);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);

            log.info("User logged in via email/password: {}", email);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", user.getId());
            data.put("email", user.getEmail());
            data.put("displayName", user.getName());
            data.put("profilePictureUrl", user.getProfilePictureUrl());
            data.put("googleConnected", user.getGoogleId() != null);
            data.put("mailboxMode", user.getGoogleId() != null ? "REAL_GMAIL" : "DEMO");

            return ResponseEntity.ok(ApiResponse.ok("Login successful", data));
        } catch (Exception e) {
            String msg = e.getMessage();
            Throwable cause = e.getCause();
            while (cause != null) {
                if (cause.getMessage() != null) msg = cause.getMessage();
                cause = cause.getCause();
            }
            log.error("Login failed: {}", msg, e);
            return ResponseEntity.ok(ApiResponse.error("Login failed: " +
                    (msg != null ? msg.substring(0, Math.min(msg.length(), 200)) : "unknown error")));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!isAuthenticated(auth)) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User user) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", user.getId());
            data.put("email", user.getEmail());
            data.put("displayName", user.getName());
            data.put("profilePictureUrl", user.getProfilePictureUrl());
            data.put("googleConnected", user.getGoogleId() != null);
            data.put("mailboxMode", user.getGoogleId() != null ? "REAL_GMAIL" : "DEMO");
            return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", data));
        }

        if (principal instanceof OAuth2User oAuth2User) {
            String email = oAuth2User.getAttribute("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
            }
            String googleId = oAuth2User.getAttribute("sub");
            if (googleId == null) {
                googleId = oAuth2User.getName();
            }
            Map<String, Object> data = new LinkedHashMap<>();
            userRepository.findByGoogleId(googleId)
                    .or(() -> userRepository.findByEmail(email.toLowerCase()))
                    .ifPresent(dbUser -> {
                        data.put("id", dbUser.getId());
                        data.put("email", dbUser.getEmail());
                        data.put("displayName", dbUser.getName());
                        data.put("profilePictureUrl", dbUser.getProfilePictureUrl());
                        data.put("googleConnected", true);
                        data.put("mailboxMode", "REAL_GMAIL");
                    });
            if (data.isEmpty()) {
                data.put("email", email);
                data.put("displayName", oAuth2User.getAttribute("name"));
                data.put("profilePictureUrl", oAuth2User.getAttribute("picture"));
                data.put("googleConnected", true);
                data.put("mailboxMode", "REAL_GMAIL");
            }
            return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", data));
        }

        return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
    }

    /**
     * Anonymous tokens ("anonymousUser") report isAuthenticated()=true, so they
     * must be excluded explicitly — otherwise logged-out browsers would look
     * authenticated while /api/ai/command correctly returns 401.
     */
    private boolean isAuthenticated(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return false;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof String) {
            return false;
        }
        if ("anonymousUser".equals(auth.getName())) {
            return false;
        }
        return auth.getAuthorities() != null
                && auth.getAuthorities().stream()
                        .noneMatch(a -> "ROLE_ANONYMOUS".equals(a.getAuthority()));
    }

    @GetMapping("/google-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> googleStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User user) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("googleConnected", user.getGoogleId() != null);
            data.put("googleEmail", user.getGoogleId() != null ? user.getEmail() : null);
            return ResponseEntity.ok(ApiResponse.ok("Google status retrieved", data));
        }

        return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
    }

    /**
     * Initiates the "Connect Google" flow.
     * Stores the current user's ID and authentication in the session so that
     * after Google OAuth completes, the Google identity is linked to THIS user
     * instead of creating a new user.
     *
     * Returns the Google OAuth URL for the frontend to redirect to.
     */
    @PostMapping("/connect-google")
    public ResponseEntity<ApiResponse<Map<String, Object>>> connectGoogle(
            HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated. Please login first."));
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User user) {
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("connectUserId", user.getId());
            session.setAttribute("originalAuthentication", auth);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("url", "/oauth2/authorization/google");
            return ResponseEntity.ok(ApiResponse.ok("Connect Google initiated", data));
        }

        return ResponseEntity.ok(ApiResponse.error("Not authenticated. Please login first."));
    }
}
