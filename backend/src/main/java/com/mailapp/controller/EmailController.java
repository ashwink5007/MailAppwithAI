package com.mailapp.controller;

import com.mailapp.dto.ApiResponse;
import com.mailapp.dto.EmailDto;
import com.mailapp.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for email operations.
 *
 * Thin controller: no business logic here.
 * All logic is delegated to EmailService.
 *
 * Future endpoints (to be implemented when needed):
 *   POST /api/emails          - send email
 *   PATCH /api/emails/{id}    - update (star, read, label)
 *   DELETE /api/emails/{id}   - trash email
 *   GET /api/emails?q=search  - search emails
 */
@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    /**
     * GET /api/emails
     * Returns all emails across all folders.
     * The frontend loads all emails once into EmailContext for local filtering.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EmailDto>>> getAllEmails() {
        List<EmailDto> emails = emailService.getAllEmails();
        return ResponseEntity.ok(
                ApiResponse.ok("Emails retrieved successfully", emails)
        );
    }

    /**
     * GET /api/emails/inbox
     * Returns only inbox emails.
     */
    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<List<EmailDto>>> getInboxEmails() {
        List<EmailDto> emails = emailService.getInboxEmails();
        return ResponseEntity.ok(
                ApiResponse.ok("Inbox emails retrieved successfully", emails)
        );
    }

    /**
     * GET /api/emails/sent
     * Returns sent emails.
     */
    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<List<EmailDto>>> getSentEmails() {
        List<EmailDto> emails = emailService.getSentEmails();
        return ResponseEntity.ok(
                ApiResponse.ok("Sent emails retrieved successfully", emails)
        );
    }

    /**
     * GET /api/emails/{id}
     * Returns a single email by ID with full thread.
     * Returns 404 if not found (via GlobalExceptionHandler).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailDto>> getEmailById(@PathVariable String id) {
        EmailDto email = emailService.getEmailById(id);
        return ResponseEntity.ok(
                ApiResponse.ok("Email retrieved successfully", email)
        );
    }
}
