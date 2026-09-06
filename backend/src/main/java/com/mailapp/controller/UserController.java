package com.mailapp.controller;

import com.mailapp.dto.ApiResponse;
import com.mailapp.entity.User;
import com.mailapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * Endpoint used by frontend AuthContext (/api/user/me).
     * Returns a map with email, name, picture directly at root level
     * while also containing id, data, success for full compatibility.
     */
    @GetMapping("/user/me")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Collections.emptyMap();
        }

        String googleId = principal.getAttribute("sub");
        if (googleId == null) {
            googleId = principal.getName();
        }
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");

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
        response.put("success", true);
        response.put("message", "User retrieved successfully");
        response.put("data", user);

        return response;
    }

    /**
     * Standard REST endpoint (/api/users/me).
     * Returns structured ApiResponse<User>.
     */
    @GetMapping("/users/me")
    public ApiResponse<User> getUsersMe(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ApiResponse.error("Not authenticated");
        }

        String googleId = principal.getAttribute("sub");
        if (googleId == null) {
            googleId = principal.getName();
        }
        String email = principal.getAttribute("email");

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
}

