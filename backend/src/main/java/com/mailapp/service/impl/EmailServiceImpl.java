package com.mailapp.service.impl;

import com.mailapp.dto.EmailDto;
import com.mailapp.dto.ReplyEmailRequest;
import com.mailapp.dto.SendEmailRequest;
import com.mailapp.entity.User;
import com.mailapp.repository.UserRepository;
import com.mailapp.service.DemoMailboxService;
import com.mailapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Primary EmailService routing dispatcher.
 *
 * Enforces two explicit mailbox modes:
 * - REAL_GMAIL: For Google OAuth2 connected users. Calls real Gmail API exclusively. Never receives mock data.
 * - DEMO: For email/password users who have not connected Google. Calls user-isolated DemoMailboxService.
 *   Demo operations (read, trash, simulated send/reply) NEVER touch real Gmail.
 */
@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final GmailApiServiceImpl gmailApiService;
    private final DemoMailboxService demoMailboxService;
    private final UserRepository userRepository;

    private enum MailboxMode {
        REAL_GMAIL,
        DEMO
    }

    private record UserRoutingContext(MailboxMode mode, User user) {}

    private UserRoutingContext resolveContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new IllegalStateException("Not authenticated");
        }

        Object principal = auth.getPrincipal();

        // 1. Google OAuth2 session
        if (principal instanceof OAuth2User || auth instanceof OAuth2AuthenticationToken) {
            return new UserRoutingContext(MailboxMode.REAL_GMAIL, null);
        }

        // 2. Email/Password session
        if (principal instanceof User user) {
            // Check if user has linked Google
            if (user.getGoogleId() != null && !user.getGoogleId().isBlank()) {
                return new UserRoutingContext(MailboxMode.REAL_GMAIL, user);
            }
            return new UserRoutingContext(MailboxMode.DEMO, user);
        }

        // Fallback for custom UserDetails
        String principalName = auth.getName();
        if (principalName != null) {
            Optional<User> userOpt = userRepository.findByEmail(principalName);
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                if (u.getGoogleId() != null && !u.getGoogleId().isBlank()) {
                    return new UserRoutingContext(MailboxMode.REAL_GMAIL, u);
                }
                return new UserRoutingContext(MailboxMode.DEMO, u);
            }
        }

        throw new IllegalStateException("Unable to determine authenticated user context");
    }

    @Override
    public List<EmailDto> getAllEmails() {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            return gmailApiService.getAllEmails();
        }
        return demoMailboxService.getAllEmails(ctx.user());
    }

    @Override
    public List<EmailDto> getInboxEmails() {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            return gmailApiService.getInboxEmails();
        }
        return demoMailboxService.getInboxEmails(ctx.user());
    }

    @Override
    public List<EmailDto> getSentEmails() {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            return gmailApiService.getSentEmails();
        }
        return demoMailboxService.getSentEmails(ctx.user());
    }

    @Override
    public EmailDto getEmailById(String id) {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            return gmailApiService.getEmailById(id);
        }
        return demoMailboxService.getEmailById(ctx.user(), id);
    }

    @Override
    public String sendEmail(SendEmailRequest request) {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            return gmailApiService.sendEmail(request);
        }
        return demoMailboxService.sendEmail(ctx.user(), request);
    }

    @Override
    public String sendReply(String id, ReplyEmailRequest request) {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            return gmailApiService.sendReply(id, request);
        }
        return demoMailboxService.sendReply(ctx.user(), id, request);
    }

    @Override
    public void markAsRead(String id) {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            gmailApiService.markAsRead(id);
            return;
        }
        demoMailboxService.markAsRead(ctx.user(), id);
    }

    @Override
    public void moveToTrash(String id) {
        UserRoutingContext ctx = resolveContext();
        if (ctx.mode() == MailboxMode.REAL_GMAIL) {
            gmailApiService.moveToTrash(id);
            return;
        }
        demoMailboxService.moveToTrash(ctx.user(), id);
    }
}
