package com.mailapp.service;

import com.mailapp.entity.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface UserService {
    User findOrCreateGoogleUser(OAuth2User oAuth2User);
}
