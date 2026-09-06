package com.mailapp.service.impl;

import com.mailapp.entity.User;
import com.mailapp.repository.UserRepository;
import com.mailapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public User findOrCreateGoogleUser(OAuth2User oAuth2User) {
        String googleId = oAuth2User.getAttribute("sub");
        if (googleId == null) {
            googleId = oAuth2User.getName();
        }
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null) {
            log.error("Missing required Google OAuth attribute: email");
            throw new IllegalArgumentException("Missing required Google OAuth attribute: email");
        }

        if (googleId == null) {
            googleId = email;
        }

        Optional<User> existingUser = userRepository.findByGoogleId(googleId);
        if (existingUser.isEmpty()) {
            existingUser = userRepository.findByEmail(email);
        }

        if (existingUser.isPresent()) {
            log.info("Google user found in database: {}", email);
            User user = existingUser.get();
            boolean updated = false;
            if (name != null && !name.equals(user.getName())) {
                user.setName(name);
                updated = true;
            }
            if (picture != null && !picture.equals(user.getProfilePictureUrl())) {
                user.setProfilePictureUrl(picture);
                updated = true;
            }
            if (user.getGoogleId() == null || !user.getGoogleId().equals(googleId)) {
                user.setGoogleId(googleId);
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
            }
            return user;
        }

        log.info("Creating new user for: {}", email);
        User newUser = User.builder()
                .googleId(googleId)
                .email(email)
                .name(name)
                .profilePictureUrl(picture)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("User saved successfully with id: {}", savedUser.getId());
        return savedUser;
    }
}
