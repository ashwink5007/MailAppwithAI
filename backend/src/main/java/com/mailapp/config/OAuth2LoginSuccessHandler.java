package com.mailapp.config;

import com.mailapp.entity.User;
import com.mailapp.repository.UserRepository;
import com.mailapp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

/**
 * Handles successful Google OAuth2 login.
 *
 * Two scenarios:
 * 1. "Connect Google" flow — user is already authenticated via email/password
 *    and wants to link their Google account. Session contains "connectUserId".
 *    After linking, restores the original email/password authentication.
 *
 * 2. Regular Google OAuth login — user authenticates directly with Google.
 *    Creates or updates the user in the database.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            response.sendRedirect(frontendUrl + "/?login=success");
            return;
        }

        OAuth2User oAuth2User = oauthToken.getPrincipal();
        HttpSession session = request.getSession(false);

        // Check for "Connect Google" intent — user was already logged in via email/password
        Long connectUserId = null;
        Authentication originalAuth = null;
        if (session != null) {
            connectUserId = (Long) session.getAttribute("connectUserId");
            originalAuth = (Authentication) session.getAttribute("originalAuthentication");
        }

        if (connectUserId != null && originalAuth != null) {
            // "Connect Google" flow — link Google identity to the existing email/password user
            handleConnectGoogle(connectUserId, oAuth2User, session);
            restoreOriginalAuthentication(originalAuth);
            log.info("Google account linked to existing user (id={})", connectUserId);
        } else {
            // Regular Google OAuth login — create or update user
            userService.findOrCreateGoogleUser(oAuth2User);
        }

        response.sendRedirect(frontendUrl + "/?login=success");
    }

    /**
     * Links the Google OAuth identity to an existing email/password user.
     * Does NOT create a new user — updates the existing user's googleId.
     */
    private void handleConnectGoogle(Long userId, OAuth2User oAuth2User, HttpSession session) {
        String googleId = oAuth2User.getAttribute("sub");
        if (googleId == null) {
            googleId = oAuth2User.getName();
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("Connect Google: user {} not found, falling back to default behavior", userId);
            userService.findOrCreateGoogleUser(oAuth2User);
            return;
        }

        User user = userOpt.get();

        // Link Google identity to the existing user
        boolean updated = false;
        if (user.getGoogleId() == null || !user.getGoogleId().equals(googleId)) {
            user.setGoogleId(googleId);
            updated = true;
        }
        String picture = oAuth2User.getAttribute("picture");
        if (picture != null && !picture.equals(user.getProfilePictureUrl())) {
            user.setProfilePictureUrl(picture);
            updated = true;
        }
        String name = oAuth2User.getAttribute("name");
        if (name != null && !name.equals(user.getName())) {
            user.setName(name);
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
        }

        // Clear the connect intent from session
        if (session != null) {
            session.removeAttribute("connectUserId");
            session.removeAttribute("originalAuthentication");
        }
    }

    /**
     * Restores the original email/password authentication after Google linking.
     * This ensures the user remains authenticated as the email/password user,
     * not as the Google user.
     */
    private void restoreOriginalAuthentication(Authentication originalAuth) {
        SecurityContextHolder.getContext().setAuthentication(originalAuth);
    }
}
