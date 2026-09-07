package com.mailapp.service;

import com.mailapp.dto.EmailDto;
import com.mailapp.dto.ReplyEmailRequest;
import com.mailapp.dto.SendEmailRequest;

import java.util.List;

/**
 * Email service contract.
 *
 * Primary implementation: GmailApiServiceImpl
 *
 * EmailController depends ONLY on this interface — not on any concrete provider.
 * The mock implementation remains available for isolated development use,
 * but real API requests are handled by the Gmail implementation.
 */
public interface EmailService {

    /**
     * Returns all emails across all folders.
     * Used to populate the full EmailContext on the frontend.
     */
    List<EmailDto> getAllEmails();

    /**
     * Returns emails in the inbox folder.
     */
    List<EmailDto> getInboxEmails();

    /**
     * Returns sent emails.
     */
    List<EmailDto> getSentEmails();

    /**
     * Returns a single email by its ID.
     * @throws com.mailapp.exception.ResourceNotFoundException if not found
     */
    EmailDto getEmailById(String id);

    String sendEmail(SendEmailRequest request);

    String sendReply(String id, ReplyEmailRequest request);

    void markAsRead(String id);

    void markAsUnread(String id);

    void toggleStar(String id);

    void toggleImportant(String id);

    void moveToTrash(String id);
}
