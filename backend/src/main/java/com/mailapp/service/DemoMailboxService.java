package com.mailapp.service;

import com.mailapp.dto.EmailDto;
import com.mailapp.dto.EmailDto.AttachmentDto;
import com.mailapp.dto.EmailDto.EmailSenderDto;
import com.mailapp.dto.EmailDto.ThreadMessageDto;
import com.mailapp.dto.ReplyEmailRequest;
import com.mailapp.dto.SendEmailRequest;
import com.mailapp.entity.User;
import com.mailapp.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Manages per-user isolated DEMO mailboxes for email/password users who have not connected Google.
 *
 * Requirements:
 * - Isolated per user: User A sees Demo A, User B sees Demo B.
 * - Realistic, fictional, clearly synthetic data covering all folders, categories, and scenarios.
 * - Actions (read, trash, simulated send/reply) persist in memory for that user across browser refreshes.
 * - NEVER interacts with or writes mock data into real Gmail.
 */
@Service
public class DemoMailboxService {

    private final Map<Long, List<EmailDto>> userMailboxes = new ConcurrentHashMap<>();
    private final AtomicLong demoIdCounter = new AtomicLong(100);

    public List<EmailDto> getAllEmails(User user) {
        return getOrCreateMailbox(user);
    }

    public List<EmailDto> getInboxEmails(User user) {
        return getOrCreateMailbox(user).stream()
                .filter(e -> "inbox".equalsIgnoreCase(e.getFolder()))
                .toList();
    }

    public List<EmailDto> getSentEmails(User user) {
        return getOrCreateMailbox(user).stream()
                .filter(e -> "sent".equalsIgnoreCase(e.getFolder()))
                .toList();
    }

    public EmailDto getEmailById(User user, String id) {
        return getOrCreateMailbox(user).stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Email", id));
    }

    public void markAsRead(User user, String id) {
        List<EmailDto> mailbox = getOrCreateMailbox(user);
        for (int i = 0; i < mailbox.size(); i++) {
            EmailDto email = mailbox.get(i);
            if (email.getId().equals(id)) {
                mailbox.set(i, copyWithReadStatus(email, true));
                return;
            }
        }
    }

    public void markAsUnread(User user, String id) {
        List<EmailDto> mailbox = getOrCreateMailbox(user);
        for (int i = 0; i < mailbox.size(); i++) {
            EmailDto email = mailbox.get(i);
            if (email.getId().equals(id)) {
                mailbox.set(i, copyWithReadStatus(email, false));
                return;
            }
        }
    }

    public void toggleStar(User user, String id) {
        List<EmailDto> mailbox = getOrCreateMailbox(user);
        for (int i = 0; i < mailbox.size(); i++) {
            EmailDto email = mailbox.get(i);
            if (email.getId().equals(id)) {
                mailbox.set(i, copyWithStarred(email, !email.isStarred()));
                return;
            }
        }
    }

    public void toggleImportant(User user, String id) {
        List<EmailDto> mailbox = getOrCreateMailbox(user);
        for (int i = 0; i < mailbox.size(); i++) {
            EmailDto email = mailbox.get(i);
            if (email.getId().equals(id)) {
                mailbox.set(i, copyWithImportant(email, !email.isImportant()));
                return;
            }
        }
    }

    public void moveToTrash(User user, String id) {
        List<EmailDto> mailbox = getOrCreateMailbox(user);
        for (int i = 0; i < mailbox.size(); i++) {
            EmailDto email = mailbox.get(i);
            if (email.getId().equals(id)) {
                mailbox.set(i, copyWithFolder(email, "trash"));
                return;
            }
        }
    }

    public String sendEmail(User user, SendEmailRequest request) {
        List<EmailDto> mailbox = getOrCreateMailbox(user);
        String messageId = "demo-msg-" + demoIdCounter.incrementAndGet();
        String userEmail = user.getEmail() != null ? user.getEmail() : "demo.user@nebulamail.app";
        String userName = user.getName() != null ? user.getName() : "Demo User";

        EmailSenderDto sender = EmailSenderDto.builder()
                .name(userName)
                .email(userEmail)
                .avatar(user.getProfilePictureUrl())
                .build();

        List<String> recipients = List.of(request.to());

        ThreadMessageDto message = ThreadMessageDto.builder()
                .id("demo-thread-" + messageId)
                .sender(sender)
                .recipients(recipients)
                .cc(request.cc() != null && !request.cc().isBlank() ? List.of(request.cc()) : List.of())
                .bcc(request.bcc() != null && !request.bcc().isBlank() ? List.of(request.bcc()) : List.of())
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .fullDate("Today at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .body(request.body())
                .attachments(List.of())
                .build();

        EmailDto newEmail = EmailDto.builder()
                .id(messageId)
                .sender(sender)
                .recipients(recipients)
                .subject(request.subject() != null && !request.subject().isBlank() ? request.subject() : "(No subject)")
                .snippet(request.body() != null && request.body().length() > 80 ? request.body().substring(0, 80) + "..." : request.body())
                .timestamp("Just now")
                .fullDate("Today at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("sent")
                .labels(List.of("Work"))
                .thread(List.of(message))
                .attachments(List.of())
                .needsResponse(false)
                .build();

        mailbox.add(0, newEmail);
        return messageId;
    }

    public String sendReply(User user, String emailId, ReplyEmailRequest request) {
        List<EmailDto> mailbox = getOrCreateMailbox(user);
        String replyId = "demo-reply-" + demoIdCounter.incrementAndGet();
        String userEmail = user.getEmail() != null ? user.getEmail() : "demo.user@nebulamail.app";
        String userName = user.getName() != null ? user.getName() : "Demo User";

        for (int i = 0; i < mailbox.size(); i++) {
            EmailDto email = mailbox.get(i);
            if (email.getId().equals(emailId)) {
                List<ThreadMessageDto> thread = new ArrayList<>(email.getThread() != null ? email.getThread() : List.of());

                ThreadMessageDto replyMsg = ThreadMessageDto.builder()
                        .id(replyId)
                        .sender(EmailSenderDto.builder().name(userName).email(userEmail).avatar(user.getProfilePictureUrl()).build())
                        .recipients(List.of(email.getSender() != null ? email.getSender().getEmail() : "recipient@example.com"))
                        .timestamp("Just now")
                        .fullDate("Today at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")))
                        .body(request.body())
                        .attachments(List.of())
                        .build();

                thread.add(replyMsg);

                EmailDto updated = EmailDto.builder()
                        .id(email.getId())
                        .sender(email.getSender())
                        .recipients(email.getRecipients())
                        .subject(email.getSubject())
                        .snippet(request.body())
                        .timestamp("Just now")
                        .fullDate("Today at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")))
                        .isRead(true)
                        .isStarred(email.isStarred())
                        .isImportant(email.isImportant())
                        .folder(email.getFolder())
                        .labels(email.getLabels())
                        .thread(thread)
                        .attachments(email.getAttachments())
                        .needsResponse(false)
                        .build();

                mailbox.set(i, updated);
                return replyId;
            }
        }
        throw new ResourceNotFoundException("Email", emailId);
    }

    private List<EmailDto> getOrCreateMailbox(User user) {
        Long userId = user != null && user.getId() != null ? user.getId() : -1L;
        return userMailboxes.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>(createInitialMockEmails(user)));
    }

    private List<EmailDto> createInitialMockEmails(User user) {
        String recipientEmail = user != null && user.getEmail() != null ? user.getEmail() : "demo.user@nebulamail.app";
        String recipientName = user != null && user.getName() != null ? user.getName() : "Demo User";
        String firstName = recipientName.split(" ")[0];

        List<EmailDto> emails = new ArrayList<>();

        // 1. Project Update (Inbox, Unread, Work, Urgent, Needs Response)
        emails.add(EmailDto.builder()
                .id("demo-project-update")
                .sender(EmailSenderDto.builder()
                        .name("Sarah Connor")
                        .email("sarah.connor@nebula.io")
                        .avatar("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("Sprint 4 Roadmap & Architecture Review")
                .snippet("Hey " + firstName + ", we need your input on the AI copilot pipeline and Q3 technical deliverables before Friday.")
                .timestamp("10:45 AM")
                .fullDate("Today at 10:45 AM")
                .isRead(false)
                .isStarred(true)
                .isImportant(true)
                .folder("inbox")
                .labels(List.of("Work", "Urgent"))
                .needsResponse(true)
                .attachments(List.of(
                        AttachmentDto.builder().id("att-1").name("Architecture_Diagram_v4.pdf").size("2.4 MB").type("pdf").build()
                ))
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-project-1")
                                .sender(EmailSenderDto.builder().name("Sarah Connor").email("sarah.connor@nebula.io").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("10:45 AM")
                                .fullDate("Today at 10:45 AM")
                                .body("Hi " + firstName + ",\n\nI have uploaded the initial drafts for the Sprint 4 roadmap. Please review the attached architecture specifications.\n\nKey discussion points:\n1. Gemini multi-turn intent resolution pipeline.\n2. User isolation guarantees for demo & production mailboxes.\n3. Session cookie cross-domain propagation.\n\nCould you send over your notes by tomorrow morning?\n\nBest,\nSarah Connor\nPrincipal Architect, Nebula Labs")
                                .attachments(List.of(AttachmentDto.builder().id("att-1").name("Architecture_Diagram_v4.pdf").size("2.4 MB").type("pdf").build()))
                                .build()
                ))
                .build());

        // 2. Recruitment / Interview (Inbox, Read, Work)
        emails.add(EmailDto.builder()
                .id("demo-recruitment")
                .sender(EmailSenderDto.builder()
                        .name("Marcus Vance")
                        .email("m.vance@horizonlabs.ai")
                        .avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("Interview Confirmation: Senior Full-Stack AI Engineer at Horizon Labs")
                .snippet("Thank you for speaking with our engineering directors. We would love to move forward with the final architecture conversation.")
                .timestamp("09:15 AM")
                .fullDate("Today at 09:15 AM")
                .isRead(true)
                .isStarred(false)
                .isImportant(true)
                .folder("inbox")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-recruit-1")
                                .sender(EmailSenderDto.builder().name("Marcus Vance").email("m.vance@horizonlabs.ai").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("09:15 AM")
                                .fullDate("Today at 09:15 AM")
                                .body("Hello " + firstName + ",\n\nThe feedback from yesterday's systems design loop was fantastic. The engineering directors were particularly impressed by your deep work on autonomous LLM state execution.\n\nWe'd like to schedule the final conversation with our VP of Engineering this Thursday at 2:00 PM EST.\n\nBest regards,\nMarcus Vance | Talent Partner")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 3. Meeting Agenda (Inbox, Read, Work, Starred)
        emails.add(EmailDto.builder()
                .id("demo-meeting")
                .sender(EmailSenderDto.builder()
                        .name("Elena Rostova")
                        .email("elena.rostova@quantumscale.io")
                        .avatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("Quarterly Product & AI Strategy Sync - Agenda & Google Meet Link")
                .snippet("Here is the finalized agenda for our upcoming quarterly product review. Please add any talking points to the doc.")
                .timestamp("Yesterday")
                .fullDate("Yesterday at 3:30 PM")
                .isRead(true)
                .isStarred(true)
                .isImportant(false)
                .folder("inbox")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-meet-1")
                                .sender(EmailSenderDto.builder().name("Elena Rostova").email("elena.rostova@quantumscale.io").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Yesterday")
                                .fullDate("Yesterday at 3:30 PM")
                                .body("Team,\n\nWe will be gathering for our quarterly engineering and product sync tomorrow. Agenda items:\n- AI Copilot user retention numbers\n- Infrastructure cost optimization on Supabase & Railway\n- Q4 roadmap highlights\n\nSee everyone there!\nElena")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 4. Invoice / Finance (Inbox, Unread, Finance)
        emails.add(EmailDto.builder()
                .id("demo-invoice")
                .sender(EmailSenderDto.builder()
                        .name("CloudOps Billing Team")
                        .email("billing@cloudops-infra.net")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("CloudOps Invoice #INV-2026-8942 - Due in 14 Days")
                .snippet("Your monthly CloudOps infrastructure statement for September 2026 is now available for download.")
                .timestamp("Yesterday")
                .fullDate("Yesterday at 11:20 AM")
                .isRead(false)
                .isStarred(false)
                .isImportant(true)
                .folder("inbox")
                .labels(List.of("Finance"))
                .needsResponse(false)
                .attachments(List.of(
                        AttachmentDto.builder().id("att-inv").name("Invoice_INV_2026_8942.pdf").size("412 KB").type("pdf").build()
                ))
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-inv-1")
                                .sender(EmailSenderDto.builder().name("CloudOps Billing Team").email("billing@cloudops-infra.net").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Yesterday")
                                .fullDate("Yesterday at 11:20 AM")
                                .body("Dear Customer,\n\nYour invoice #INV-2026-8942 for production hosting and PostgreSQL database compute is ready. Total amount: $148.50.\n\nPayment will automatically be processed on September 21, 2026. You can review line items in the attached PDF.\n\nThank you for choosing CloudOps.")
                                .attachments(List.of(AttachmentDto.builder().id("att-inv").name("Invoice_INV_2026_8942.pdf").size("412 KB").type("pdf").build()))
                                .build()
                ))
                .build());

        // 5. Newsletter (Inbox, Read, Promotions)
        emails.add(EmailDto.builder()
                .id("demo-newsletter")
                .sender(EmailSenderDto.builder()
                        .name("Engineering Weekly")
                        .email("newsletter@engineeringweekly.tech")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("AI Systems Dispatch #48: Agentic Coding Patterns & Multi-Model Orchestration")
                .snippet("In this edition: Building autonomous agent loops, prompt sandboxing, and UI tool binding in Next.js 16.")
                .timestamp("Sep 5")
                .fullDate("September 5, 2026 at 8:00 AM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("inbox")
                .labels(List.of("Promotions"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-news-1")
                                .sender(EmailSenderDto.builder().name("Engineering Weekly").email("newsletter@engineeringweekly.tech").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Sep 5")
                                .fullDate("September 5, 2026 at 8:00 AM")
                                .body("Hello Engineers!\n\nThis week we explore the shift towards structured tool-calling with Gemini 2.5 and CopilotKit in modern React applications. We analyze how state-driven AI actions prevent DOM fragility while providing rich interactive experiences.\n\nRead the full article on our website!")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 6. Personal Mail (Inbox, Read, Personal, Starred)
        emails.add(EmailDto.builder()
                .id("demo-personal")
                .sender(EmailSenderDto.builder()
                        .name("David Miller")
                        .email("david.miller@gmail.com")
                        .avatar("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("Weekend Hiking Trip & Cabin Reservation at Pine Valley")
                .snippet("Hey! I confirmed the cabin booking for Saturday. Let me know if you want me to bring the barbecue gear.")
                .timestamp("Sep 4")
                .fullDate("September 4, 2026 at 6:45 PM")
                .isRead(true)
                .isStarred(true)
                .isImportant(false)
                .folder("inbox")
                .labels(List.of("Personal"))
                .needsResponse(true)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-pers-1")
                                .sender(EmailSenderDto.builder().name("David Miller").email("david.miller@gmail.com").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Sep 4")
                                .fullDate("September 4, 2026 at 6:45 PM")
                                .body("Hey " + firstName + ",\n\nThe cabin reservation at Pine Valley is locked in for this coming weekend! The weather forecast is completely clear. Are you still good to drive up together on Saturday morning?\n\nCheers,\nDavid")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 7. Deadline / Alert (Inbox, Unread, Urgent, Important)
        emails.add(EmailDto.builder()
                .id("demo-deadline")
                .sender(EmailSenderDto.builder()
                        .name("Security Compliance Officer")
                        .email("compliance@nebulamail.app")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("URGENT: Annual Security & SOC2 Compliance Certification Due Tomorrow")
                .snippet("Please complete the required 15-minute security acknowledgment module before 5:00 PM tomorrow.")
                .timestamp("Sep 3")
                .fullDate("September 3, 2026 at 2:00 PM")
                .isRead(false)
                .isStarred(false)
                .isImportant(true)
                .folder("inbox")
                .labels(List.of("Urgent", "Work"))
                .needsResponse(true)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-sec-mod-1")
                                .sender(EmailSenderDto.builder().name("Security Compliance Officer").email("compliance@nebulamail.app").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Sep 3")
                                .fullDate("September 3, 2026 at 2:00 PM")
                                .body("All Employees,\n\nOur annual SOC2 Type II audit window begins next week. Every team member with database or production access must complete the 2026 Data Protection Refresh module by tomorrow at 5:00 PM.\n\nThank you for keeping our platform secure.\nNebula Information Security")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 8. Event / Conference (Inbox, Read, Social)
        emails.add(EmailDto.builder()
                .id("demo-event")
                .sender(EmailSenderDto.builder()
                        .name("TechSummit 2026 Organizing Committee")
                        .email("speakers@techsummit.io")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("Speaker Invitation: Nebula AI Global Tech Summit 2026")
                .snippet("We would love to invite you to present a keynote session on intelligent email copilot architecture.")
                .timestamp("Sep 2")
                .fullDate("September 2, 2026 at 10:15 AM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("inbox")
                .labels(List.of("Social", "Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-event-1")
                                .sender(EmailSenderDto.builder().name("TechSummit 2026").email("speakers@techsummit.io").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Sep 2")
                                .fullDate("September 2, 2026 at 10:15 AM")
                                .body("Dear " + firstName + ",\n\nFollowing your outstanding work on natural language agents and full-stack integration, we would be delighted to host you as a speaker at TechSummit 2026 in San Francisco this November.\n\nLooking forward to hearing from you,\nSummit Committee")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 9. Finance / Banking (Inbox, Read, Finance)
        emails.add(EmailDto.builder()
                .id("demo-finance")
                .sender(EmailSenderDto.builder()
                        .name("FinPulse Bank Alerts")
                        .email("alerts@finpulsebank.com")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("FinPulse Bank: Your Monthly Account Statement & Tax Summary is Ready")
                .snippet("Your August e-statement is now available in your online portal with updated interest calculations.")
                .timestamp("Sep 1")
                .fullDate("September 1, 2026 at 9:00 AM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("inbox")
                .labels(List.of("Finance"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-bank-1")
                                .sender(EmailSenderDto.builder().name("FinPulse Bank Alerts").email("alerts@finpulsebank.com").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Sep 1")
                                .fullDate("September 1, 2026 at 9:00 AM")
                                .body("Hello,\n\nYour monthly statement for account ending in *8831 is now ready for download. No suspicious transactions were detected.\n\nThank you for banking with FinPulse.")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 10. Social Notification (Inbox, Unread, Social)
        emails.add(EmailDto.builder()
                .id("demo-social")
                .sender(EmailSenderDto.builder()
                        .name("TechNetwork Community")
                        .email("notifications@technetwork.dev")
                        .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                        .build())
                .recipients(List.of(recipientEmail))
                .subject("Alex Rivera sent you a message: 'Loved your AI copilot demo!'")
                .snippet("Alex Rivera commented on your recent open-source release on TechNetwork.")
                .timestamp("Aug 30")
                .fullDate("August 30, 2026 at 4:10 PM")
                .isRead(false)
                .isStarred(false)
                .isImportant(false)
                .folder("inbox")
                .labels(List.of("Social"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-soc-1")
                                .sender(EmailSenderDto.builder().name("TechNetwork Community").email("notifications@technetwork.dev").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Aug 30")
                                .fullDate("August 30, 2026 at 4:10 PM")
                                .body("Alex Rivera commented:\n\"The speed of execution and context awareness in your Copilot demo is seriously impressive. Would love to connect and chat about model orchestration.\"\n\nReply via TechNetwork.")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 11. Sent Email 1 (Folder: Sent, Read)
        emails.add(EmailDto.builder()
                .id("demo-sent-1")
                .sender(EmailSenderDto.builder().name(recipientName).email(recipientEmail).avatar(user != null ? user.getProfilePictureUrl() : null).build())
                .recipients(List.of("sarah.connor@nebula.io"))
                .subject("Re: Sprint 4 Roadmap & Architecture Review - Approved")
                .snippet("Thanks Sarah, the architecture specs look solid. Let's proceed with the CopilotKit React state synchronization.")
                .timestamp("Yesterday")
                .fullDate("Yesterday at 4:15 PM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("sent")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-sent-thread-1")
                                .sender(EmailSenderDto.builder().name(recipientName).email(recipientEmail).build())
                                .recipients(List.of("sarah.connor@nebula.io"))
                                .timestamp("Yesterday")
                                .fullDate("Yesterday at 4:15 PM")
                                .body("Hi Sarah,\n\nI reviewed the architecture specs. Everything looks clean and production ready. Let's ship it!\n\nBest,\n" + firstName)
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 12. Sent Email 2 (Folder: Sent, Read)
        emails.add(EmailDto.builder()
                .id("demo-sent-2")
                .sender(EmailSenderDto.builder().name(recipientName).email(recipientEmail).build())
                .recipients(List.of("design-team@nebulamail.app"))
                .subject("Design System Guidelines for Mobile & Tablet Views")
                .snippet("Team, here are the responsive breakpoint specifications and Tailwind token updates for the header and sidebar.")
                .timestamp("Sep 3")
                .fullDate("September 3, 2026 at 11:30 AM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("sent")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-sent-thread-2")
                                .sender(EmailSenderDto.builder().name(recipientName).email(recipientEmail).build())
                                .recipients(List.of("design-team@nebulamail.app"))
                                .timestamp("Sep 3")
                                .fullDate("September 3, 2026 at 11:30 AM")
                                .body("Design Team,\n\nPlease see the attached specs for the responsive layout refactor.\n\nThanks,\n" + firstName)
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 13. Draft Email (Folder: Drafts)
        emails.add(EmailDto.builder()
                .id("demo-draft-1")
                .sender(EmailSenderDto.builder().name(recipientName).email(recipientEmail).build())
                .recipients(List.of("partners@ai-ventures.com"))
                .subject("Draft: Q4 AI Product Initiatives Proposal")
                .snippet("Draft notes on scaling intelligent email assistants with automated tool execution...")
                .timestamp("Sep 4")
                .fullDate("September 4, 2026 at 5:00 PM")
                .isRead(false)
                .isStarred(false)
                .isImportant(false)
                .folder("drafts")
                .labels(List.of("Work"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-draft-1")
                                .sender(EmailSenderDto.builder().name(recipientName).email(recipientEmail).build())
                                .recipients(List.of("partners@ai-ventures.com"))
                                .timestamp("Sep 4")
                                .fullDate("September 4, 2026 at 5:00 PM")
                                .body("Draft notes: We are proposing a unified workspace combining email threads with natural language AI copilot tools...")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 14. Trash Email (Folder: Trash)
        emails.add(EmailDto.builder()
                .id("demo-trash-1")
                .sender(EmailSenderDto.builder().name("Old Webinar Host").email("webinars@growthtactics.xyz").build())
                .recipients(List.of(recipientEmail))
                .subject("Archived Webinar: Organic Growth Tactics 2025")
                .snippet("Recording and slide deck from last year's organic marketing conference.")
                .timestamp("Aug 15")
                .fullDate("August 15, 2026 at 10:00 AM")
                .isRead(true)
                .isStarred(false)
                .isImportant(false)
                .folder("trash")
                .labels(List.of("Promotions"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-trash-1")
                                .sender(EmailSenderDto.builder().name("Old Webinar Host").email("webinars@growthtactics.xyz").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Aug 15")
                                .fullDate("August 15, 2026 at 10:00 AM")
                                .body("This is an archived message that was moved to trash.")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        // 15. Spam Email (Folder: Spam)
        emails.add(EmailDto.builder()
                .id("demo-spam-1")
                .sender(EmailSenderDto.builder().name("Crypto Rewards Prize").email("winner@prize-crypto-airdrop.online").build())
                .recipients(List.of(recipientEmail))
                .subject("Instant Crypto Loan & Reward Approved - Claim Voucher")
                .snippet("Congratulations! Click here to claim your $5,000 promotional voucher now.")
                .timestamp("Aug 20")
                .fullDate("August 20, 2026 at 1:15 AM")
                .isRead(false)
                .isStarred(false)
                .isImportant(false)
                .folder("spam")
                .labels(List.of("Promotions"))
                .needsResponse(false)
                .thread(List.of(
                        ThreadMessageDto.builder()
                                .id("msg-spam-1")
                                .sender(EmailSenderDto.builder().name("Crypto Rewards Prize").email("winner@prize-crypto-airdrop.online").build())
                                .recipients(List.of(recipientEmail))
                                .timestamp("Aug 20")
                                .fullDate("August 20, 2026 at 1:15 AM")
                                .body("Your wallet address won our weekly lottery. Click to verify your identity.")
                                .attachments(List.of())
                                .build()
                ))
                .build());

        return emails;
    }

    private EmailDto copyWithReadStatus(EmailDto original, boolean isRead) {
        return EmailDto.builder()
                .id(original.getId())
                .sender(original.getSender())
                .recipients(original.getRecipients())
                .subject(original.getSubject())
                .snippet(original.getSnippet())
                .timestamp(original.getTimestamp())
                .fullDate(original.getFullDate())
                .isRead(isRead)
                .isStarred(original.isStarred())
                .isImportant(original.isImportant())
                .folder(original.getFolder())
                .labels(original.getLabels())
                .thread(original.getThread())
                .attachments(original.getAttachments())
                .needsResponse(original.getNeedsResponse())
                .build();
    }

    private EmailDto copyWithFolder(EmailDto original, String folder) {
        return EmailDto.builder()
                .id(original.getId())
                .sender(original.getSender())
                .recipients(original.getRecipients())
                .subject(original.getSubject())
                .snippet(original.getSnippet())
                .timestamp(original.getTimestamp())
                .fullDate(original.getFullDate())
                .isRead(original.isRead())
                .isStarred(original.isStarred())
                .isImportant(original.isImportant())
                .folder(folder)
                .labels(original.getLabels())
                .thread(original.getThread())
                .attachments(original.getAttachments())
                .needsResponse(original.getNeedsResponse())
                .build();
    }

    private EmailDto copyWithStarred(EmailDto original, boolean isStarred) {
        return EmailDto.builder()
                .id(original.getId())
                .sender(original.getSender())
                .recipients(original.getRecipients())
                .subject(original.getSubject())
                .snippet(original.getSnippet())
                .timestamp(original.getTimestamp())
                .fullDate(original.getFullDate())
                .isRead(original.isRead())
                .isStarred(isStarred)
                .isImportant(original.isImportant())
                .folder(original.getFolder())
                .labels(original.getLabels())
                .thread(original.getThread())
                .attachments(original.getAttachments())
                .needsResponse(original.getNeedsResponse())
                .build();
    }

    private EmailDto copyWithImportant(EmailDto original, boolean isImportant) {
        return EmailDto.builder()
                .id(original.getId())
                .sender(original.getSender())
                .recipients(original.getRecipients())
                .subject(original.getSubject())
                .snippet(original.getSnippet())
                .timestamp(original.getTimestamp())
                .fullDate(original.getFullDate())
                .isRead(original.isRead())
                .isStarred(original.isStarred())
                .isImportant(isImportant)
                .folder(original.getFolder())
                .labels(original.getLabels())
                .thread(original.getThread())
                .attachments(original.getAttachments())
                .needsResponse(original.getNeedsResponse())
                .build();
    }
}
