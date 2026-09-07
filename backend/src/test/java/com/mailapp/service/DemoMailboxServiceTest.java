package com.mailapp.service;

import com.mailapp.dto.EmailDto;
import com.mailapp.dto.ReplyEmailRequest;
import com.mailapp.dto.SendEmailRequest;
import com.mailapp.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DemoMailboxServiceTest {

    private DemoMailboxService demoMailboxService;
    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        demoMailboxService = new DemoMailboxService();

        userA = User.builder()
                .id(101L)
                .email("alice@nebulamail.app")
                .name("Alice Smith")
                .build();

        userB = User.builder()
                .id(102L)
                .email("bob@nebulamail.app")
                .name("Bob Jones")
                .build();
    }

    @Test
    void initializesRealisticSyntheticMailbox() {
        List<EmailDto> emails = demoMailboxService.getAllEmails(userA);

        assertNotNull(emails);
        assertFalse(emails.isEmpty());
        // Verify inbox, sent, and drafts exist
        assertTrue(emails.stream().anyMatch(e -> "inbox".equalsIgnoreCase(e.getFolder())));
        assertTrue(emails.stream().anyMatch(e -> "sent".equalsIgnoreCase(e.getFolder())));
        assertTrue(emails.stream().anyMatch(e -> "drafts".equalsIgnoreCase(e.getFolder())));
        // Verify user email is recipient on incoming emails
        assertTrue(emails.stream().filter(e -> "inbox".equalsIgnoreCase(e.getFolder()))
                .allMatch(e -> e.getRecipients().contains(userA.getEmail())));
    }

    @Test
    void guaranteesUserIsolationBetweenUsers() {
        List<EmailDto> emailsA = demoMailboxService.getAllEmails(userA);
        List<EmailDto> emailsB = demoMailboxService.getAllEmails(userB);

        // User A modifies an email in their mailbox
        String targetId = emailsA.get(0).getId();
        demoMailboxService.moveToTrash(userA, targetId);

        EmailDto modifiedA = demoMailboxService.getEmailById(userA, targetId);
        assertEquals("trash", modifiedA.getFolder());

        // User B's mailbox should NOT have that email trashed
        EmailDto unaffectedB = demoMailboxService.getEmailById(userB, targetId);
        assertNotEquals("trash", unaffectedB.getFolder(), "User A's modification must not leak to User B");
    }

    @Test
    void simulatedSendAddsToSentFolder() {
        SendEmailRequest request = new SendEmailRequest("colleague@example.com", null, null, "Test Subject", "Test Body");
        String messageId = demoMailboxService.sendEmail(userA, request);

        assertNotNull(messageId);
        List<EmailDto> sent = demoMailboxService.getSentEmails(userA);
        assertTrue(sent.stream().anyMatch(e -> e.getId().equals(messageId)));
    }

    @Test
    void simulatedReplyAppendsToThread() {
        List<EmailDto> inbox = demoMailboxService.getInboxEmails(userA);
        String emailId = inbox.get(0).getId();
        int initialThreadCount = inbox.get(0).getThread().size();

        ReplyEmailRequest request = new ReplyEmailRequest("Got your update, thanks!");
        String replyId = demoMailboxService.sendReply(userA, emailId, request);

        assertNotNull(replyId);
        EmailDto updated = demoMailboxService.getEmailById(userA, emailId);
        assertEquals(initialThreadCount + 1, updated.getThread().size());
    }

    @Test
    void markAsReadUpdatesStatus() {
        List<EmailDto> emails = demoMailboxService.getAllEmails(userA);
        EmailDto unread = emails.stream().filter(e -> !e.isRead()).findFirst().orElseThrow();

        demoMailboxService.markAsRead(userA, unread.getId());
        EmailDto updated = demoMailboxService.getEmailById(userA, unread.getId());

        assertTrue(updated.isRead());
    }
}
