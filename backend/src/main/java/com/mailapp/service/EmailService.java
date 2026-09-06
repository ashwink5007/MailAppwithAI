package com.mailapp.service;

import com.mailapp.dto.EmailDto;

import java.util.List;

/**
 * Email service contract.
 *
 * Current implementation: MockEmailDataProvider
 * Future implementation: GmailService
 *
 * EmailController depends ONLY on this interface — not on any concrete provider.
 * Swapping providers requires zero controller changes.
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
}
