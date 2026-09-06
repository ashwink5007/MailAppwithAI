package com.mailapp.provider;

import com.mailapp.dto.EmailDto;
import com.mailapp.dto.EmailDto.AttachmentDto;
import com.mailapp.dto.EmailDto.EmailSenderDto;
import com.mailapp.dto.EmailDto.ThreadMessageDto;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Temporary mock email data provider.
 *
 * This component is the ONLY place that holds hardcoded email data.
 * Controllers and Services never directly reference mock data.
 *
 * When Gmail integration is implemented in a future sprint, this class
 * will be replaced by GmailService. The EmailService interface and
 * EmailController remain unchanged.
 *
 * Architecture:
 *   EmailController → EmailService → MockEmailDataProvider  (now)
 *   EmailController → EmailService → GmailService           (later)
 */
@Component
public class MockEmailDataProvider {

    // ── Shared sender objects ────────────────────────────────────────────────

    private static final EmailSenderDto GOOGLE_TEAM = EmailSenderDto.builder()
            .name("Google Community Team")
            .email("googlecommunityteam-noreply@google.com")
            .avatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80")
            .build();

    private static final EmailSenderDto GOOGLE_SECURITY = EmailSenderDto.builder()
            .name("Google Account Security")
            .email("no-reply@accounts.google.com")
            .build();

    private static final EmailSenderDto SARAH_CONNOR = EmailSenderDto.builder()
            .name("Sarah Connor")
            .email("sarah.connor@nebula.io")
            .avatar("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80")
            .build();

    private static final EmailSenderDto GITHUB = EmailSenderDto.builder()
            .name("GitHub Notifications")
            .email("notifications@github.com")
            .build();

    private static final EmailSenderDto DEMO_USER = EmailSenderDto.builder()
            .name("Ashwin Kumar")
            .email("ashwink5007@gmail.com")
            .build();

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Returns all inbox emails.
     */
    public List<EmailDto> getInboxEmails() {
        return List.of(
                buildGmailWelcomeEmail(),
                buildGoogleSecurityEmail(),
                buildTeamProjectEmail(),
                buildGithubNotificationEmail()
        );
    }

    /**
     * Returns all sent emails.
     */
    public List<EmailDto> getSentEmails() {
        return List.of(
                buildSentReplyEmail(),
                buildSentFollowupEmail()
        );
    }

    /**
     * Returns ALL emails (inbox + sent + drafts combined) for the email context.
     */
    public List<EmailDto> getAllEmails() {
        return List.of(
                buildGmailWelcomeEmail(),
                buildGoogleSecurityEmail(),
                buildTeamProjectEmail(),
                buildGithubNotificationEmail(),
                buildSentReplyEmail(),
                buildSentFollowupEmail(),
                buildDraftEmail()
        );
    }

    /**
     * Finds a single email by ID across all folders.
     */
    public EmailDto findById(String id) {
        return getAllEmails().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    // ── Builder methods ──────────────────────────────────────────────────────

    private EmailDto buildGmailWelcomeEmail() {
        AttachmentDto guide = AttachmentDto.builder()
                .id("att-gmail-guide")
                .name("Gmail_OAuth2_Security_Whitepaper.pdf")
                .size("1.8 MB")
                .type("pdf")
                .build();

        return EmailDto.builder()
                .id("email-gmail-welcome")
                .sender(GOOGLE_TEAM)
                .recipients(List.of("ashwink5007@gmail.com"))
                .subject("Welcome to your connected Gmail account, Ashwin!")
                .snippet("Hi Ashwin, your Gmail address is now securely connected to AiMail Copilot with OAuth 2.0 PKCE...")
                .timestamp("10:45 AM")
                .fullDate("Today at 10:45 AM")
                .isRead(false)
                .isStarred(true)
                .isImportant(true)
                .folder("inbox")
                .labels(List.of("Work", "Urgent"))
                .needsResponse(false)
                .attachments(List.of(guide))
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-gmail-1")
                                .sender(GOOGLE_TEAM)
                                .recipients(List.of("ashwink5007@gmail.com"))
                                .timestamp("10:45 AM")
                                .fullDate("Today, 10:45 AM")
                                .body("Hi Ashwin,\n\nWelcome to your new Gmail workspace on AiMail!\n\nYour Google account (ashwink5007@gmail.com) was successfully verified via OAuth 2.0. You now have access to real-time email synchronization, smart thread summarization, and AI Copilot drafting.\n\nHere are 3 tips to get the most out of your mailbox:\n1. Click \"AI Copilot\" in the top bar to inspect conversations or summarize threads.\n2. Use the quick prompt pills to draft automated replies.\n3. Organize your mail with custom colored labels.\n\nHappy emailing!\nThe Google Community Team")
                                .attachments(List.of(guide))
                                .build()
                ))
                .build();
    }

    private EmailDto buildGoogleSecurityEmail() {
        return EmailDto.builder()
                .id("email-google-security")
                .sender(GOOGLE_SECURITY)
                .recipients(List.of("ashwink5007@gmail.com"))
                .subject("Security alert for ashwink5007@gmail.com: AiMail was granted access")
                .snippet("Your Google Account was accessed by AiMail Copilot via OAuth 2.0. If this was you, no action is needed...")
                .timestamp("10:44 AM")
                .fullDate("Today at 10:44 AM")
                .isRead(false)
                .isStarred(false)
                .isImportant(true)
                .folder("inbox")
                .labels(List.of("Finance", "Urgent"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-sec-1")
                                .sender(GOOGLE_SECURITY)
                                .recipients(List.of("ashwink5007@gmail.com"))
                                .timestamp("10:44 AM")
                                .fullDate("Today, 10:44 AM")
                                .body("Security alert for: ashwink5007@gmail.com\n\nAiMail was granted access to your Google Account:\n- Client ID: 89410294-aimail.apps.googleusercontent.com\n- Access Type: OAuth 2.0 PKCE with SSL TLS 1.3\n- Scopes: https://mail.google.com/, userinfo.email, userinfo.profile\n\nIf you authorized this application, your account is safe and you can start using AiMail right away.")
                                .build()
                ))
                .build();
    }

    private EmailDto buildTeamProjectEmail() {
        AttachmentDto pdf = AttachmentDto.builder()
                .id("att-roadmap")
                .name("Nebula_Frontend_Milestones.pdf")
                .size("2.4 MB")
                .type("pdf")
                .build();

        AttachmentDto img = AttachmentDto.builder()
                .id("att-preview")
                .name("Architecture_Diagram.png")
                .size("890 KB")
                .type("image")
                .build();

        return EmailDto.builder()
                .id("email-team-project")
                .sender(SARAH_CONNOR)
                .recipients(List.of("ashwink5007@gmail.com"))
                .subject("Nebula Q3 Roadmap & Deliverables Review")
                .snippet("Hey Ashwin, I've uploaded the deliverables for the hiring task and frontend project. Let me know when you can review...")
                .timestamp("09:30 AM")
                .fullDate("Today at 09:30 AM")
                .isRead(false)
                .isStarred(true)
                .isImportant(true)
                .folder("inbox")
                .labels(List.of("Work"))
                .needsResponse(true)
                .attachments(List.of(pdf, img))
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-team-1")
                                .sender(SARAH_CONNOR)
                                .recipients(List.of("ashwink5007@gmail.com"))
                                .timestamp("09:30 AM")
                                .fullDate("Today, 09:30 AM")
                                .body("Hi Ashwin,\n\nI'm sharing the updated specifications for our frontend workspace. The bright blue theme and OAuth 2.0 authentication flow look crisp and responsive!\n\nCould you review the attached PDF and confirm if we're ready to deploy to production this afternoon?\n\nBest,\nSarah")
                                .attachments(List.of(pdf))
                                .build()
                ))
                .build();
    }

    private EmailDto buildGithubNotificationEmail() {
        return EmailDto.builder()
                .id("email-cloud-digest")
                .sender(GITHUB)
                .recipients(List.of("ashwink5007@gmail.com"))
                .subject("[GitHub] ashwink5007/MailAppwithAI: Successful push to main")
                .snippet("Your latest commit d16112e was successfully verified and deployed to main branch...")
                .timestamp("Yesterday")
                .fullDate("Yesterday at 11:15 PM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("inbox")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-gh-1")
                                .sender(GITHUB)
                                .recipients(List.of("ashwink5007@gmail.com"))
                                .timestamp("Yesterday")
                                .fullDate("Yesterday, 11:15 PM")
                                .body("Hi Ashwin,\n\nGitHub Actions report:\n- Repository: https://github.com/ashwink5007/MailAppwithAI\n- Branch: main\n- Status: Build & Lint passing (100% test coverage)\n\nAll workflows completed with exit code 0.")
                                .build()
                ))
                .build();
    }

    private EmailDto buildSentReplyEmail() {
        return EmailDto.builder()
                .id("email-sent-sync")
                .sender(DEMO_USER)
                .recipients(List.of("sarah.connor@nebula.io"))
                .subject("Re: Project onboarding and OAuth integration")
                .snippet("Thanks Sarah, I have successfully authenticated my Google account and tested the AI Copilot features...")
                .timestamp("Oct 28")
                .fullDate("Oct 28 at 02:10 PM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("sent")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-sent-1")
                                .sender(DEMO_USER)
                                .recipients(List.of("sarah.connor@nebula.io"))
                                .timestamp("Oct 28")
                                .fullDate("Oct 28, 02:10 PM")
                                .body("Hi Sarah,\n\nI have successfully configured the OAuth 2.0 login gateway and verified synchronization with my Gmail account (ashwink5007@gmail.com). Everything is working smoothly!\n\nBest regards,\nAshwin Kumar")
                                .build()
                ))
                .build();
    }

    private EmailDto buildSentFollowupEmail() {
        return EmailDto.builder()
                .id("email-sent-followup")
                .sender(DEMO_USER)
                .recipients(List.of("team@aimail.io"))
                .subject("Backend API Integration - Sprint 3.1 Complete")
                .snippet("Team, I've completed the Spring Boot backend with mock data provider and connected the Next.js frontend...")
                .timestamp("Oct 29")
                .fullDate("Oct 29 at 09:00 AM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("sent")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-sent-2")
                                .sender(DEMO_USER)
                                .recipients(List.of("team@aimail.io"))
                                .timestamp("Oct 29")
                                .fullDate("Oct 29, 09:00 AM")
                                .body("Team,\n\nSprint 3.1 is complete. The Spring Boot backend is running on port 8080, serving mock email data via REST APIs.\n\nEndpoints verified:\n- GET /api/health ✓\n- GET /api/emails/inbox ✓\n- GET /api/emails/sent ✓\n- GET /api/emails/{id} ✓\n\nThe Next.js frontend now fetches data from the backend instead of the mock files.\n\nReady for Sprint 3.2: Gmail API integration.\n\nAshwin")
                                .build()
                ))
                .build();
    }

    private EmailDto buildDraftEmail() {
        return EmailDto.builder()
                .id("email-draft-sync")
                .sender(DEMO_USER)
                .recipients(List.of("team@aimail.io"))
                .subject("[Draft] Notes on Next.js Turbopack performance improvements")
                .snippet("Draft note: Turbopack compilation latency reduced to 724ms on local build...")
                .timestamp("Oct 27")
                .fullDate("Oct 27 at 05:00 PM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("drafts")
                .labels(List.of("Personal"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-draft-1")
                                .sender(DEMO_USER)
                                .recipients(List.of("team@aimail.io"))
                                .timestamp("Oct 27")
                                .fullDate("Oct 27, 05:00 PM")
                                .body("Performance notes:\n\n- Zero cold start overhead\n- Instant re-rendering with React 19\n- Turbopack compilation: 724ms")
                                .build()
                ))
                .build();
    }
}
