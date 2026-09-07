package com.mailapp.controller;

import com.mailapp.dto.ApiResponse;
import com.mailapp.entity.User;
import com.mailapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * Endpoint used by frontend AuthContext (/api/user/me).
     * Supports both Google OAuth and email/password authentication.
     */
    @GetMapping("/user/me")
    public Map<String, Object> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return Collections.emptyMap();
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User user) {
            Map<String, Object> response = new HashMap<>();
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("picture", user.getProfilePictureUrl());
            response.put("profilePictureUrl", user.getProfilePictureUrl());
            response.put("id", user.getId());
            response.put("googleId", user.getGoogleId());
            response.put("googleConnected", user.getGoogleId() != null);
            response.put("mailboxMode", user.getGoogleId() != null ? "REAL_GMAIL" : "DEMO");
            response.put("success", true);
            response.put("message", "User retrieved successfully");
            response.put("data", user);
            return response;
        }

        if (principal instanceof OAuth2User oAuth2User) {
            return handleOAuth2Principal(oAuth2User);
        }

        return Collections.emptyMap();
    }

    /**
     * Standard REST endpoint (/api/users/me).
     * Supports both Google OAuth and email/password authentication.
     */
    @GetMapping("/users/me")
    public ApiResponse<User> getUsersMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return ApiResponse.error("Not authenticated");
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User user) {
            return ApiResponse.ok("User retrieved successfully", user);
        }

        if (principal instanceof OAuth2User oAuth2User) {
            String googleId = oAuth2User.getAttribute("sub");
            if (googleId == null) {
                googleId = oAuth2User.getName();
            }
            String email = oAuth2User.getAttribute("email");
            Optional<User> userOpt = Optional.empty();
            if (googleId != null) {
                userOpt = userRepository.findByGoogleId(googleId);
            }
            if (userOpt.isEmpty() && email != null) {
                userOpt = userRepository.findByEmail(email);
            }
            return userOpt.map(user -> ApiResponse.ok("User retrieved successfully", user))
                    .orElseGet(() -> ApiResponse.error("User not found in database"));
        }

        return ApiResponse.error("Not authenticated");
    }

    private Map<String, Object> handleOAuth2Principal(OAuth2User oAuth2User) {
        String googleId = oAuth2User.getAttribute("sub");
        if (googleId == null) {
            googleId = oAuth2User.getName();
        }
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> userOpt = Optional.empty();
        if (googleId != null) {
            userOpt = userRepository.findByGoogleId(googleId);
        }
        if (userOpt.isEmpty() && email != null) {
            userOpt = userRepository.findByEmail(email);
        }

        User user = userOpt.orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("name", user != null && user.getName() != null ? user.getName() : (name != null ? name : ""));
        response.put("email", user != null && user.getEmail() != null ? user.getEmail() : (email != null ? email : ""));
        response.put("picture", user != null && user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : (picture != null ? picture : ""));
        response.put("profilePictureUrl", user != null && user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : (picture != null ? picture : ""));
        response.put("id", user != null ? user.getId() : null);
        response.put("googleId", user != null ? user.getGoogleId() : googleId);
        response.put("googleConnected", true);
        response.put("mailboxMode", "REAL_GMAIL");
        response.put("success", true);
        response.put("message", "User retrieved successfully");
        response.put("data", user);

        return response;
    }
}
