package com.mailapp.service.impl;

import com.mailapp.dto.EmailDto;
import com.mailapp.exception.ResourceNotFoundException;
import com.mailapp.provider.MockEmailDataProvider;
import com.mailapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * EmailService implementation backed by MockEmailDataProvider.
 *
 * Business logic lives here — the controller stays thin.
 *
 * To switch to Gmail:
 *   1. Create GmailEmailDataProvider implementing the same data methods
 *   2. Inject it here instead of MockEmailDataProvider (or use a @Profile)
 *   3. Zero controller changes required
 */
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final MockEmailDataProvider mockEmailDataProvider;

    @Override
    public List<EmailDto> getAllEmails() {
        return mockEmailDataProvider.getAllEmails();
    }

    @Override
    public List<EmailDto> getInboxEmails() {
        return mockEmailDataProvider.getInboxEmails();
    }

    @Override
    public List<EmailDto> getSentEmails() {
        return mockEmailDataProvider.getSentEmails();
    }

    @Override
    public EmailDto getEmailById(String id) {
        EmailDto email = mockEmailDataProvider.findById(id);
        if (email == null) {
            throw new ResourceNotFoundException("Email", id);
        }
        return email;
    }
}
