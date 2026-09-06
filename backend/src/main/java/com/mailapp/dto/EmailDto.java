package com.mailapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Email Data Transfer Object.
 *
 * Shape exactly mirrors the frontend Email interface in types/email.ts
 * so that the frontend requires zero adaptation.
 *
 * Field names use camelCase matching the TypeScript interface.
 *
 * Future: GmailService will map Gmail API responses → EmailDto.
 * The frontend never touches the Gmail-specific structures.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailDto {

    private String id;

    /** Nested sender object: { name, email, avatar? } */
    private EmailSenderDto sender;

    /** List of recipient email addresses */
    private List<String> recipients;

    private String subject;

    /** Short preview text shown in the email list */
    private String snippet;

    /** Short display timestamp e.g. "10:45 AM" or "Yesterday" */
    private String timestamp;

    /** Full human-readable date e.g. "Today at 10:45 AM" */
    private String fullDate;

    private boolean isRead;
    private boolean isStarred;
    private boolean isImportant;

    /** One of: inbox | starred | sent | drafts | important | spam | trash */
    private String folder;

    /** Labels e.g. ["Work", "Urgent"] */
    private List<String> labels;

    /** Ordered list of messages in this thread (at minimum one message with the body) */
    private List<ThreadMessageDto> thread;

    /** Optional attachments on the email */
    private List<AttachmentDto> attachments;

    /** True when the email is flagged as requiring a response */
    private Boolean needsResponse;

    // ── Nested DTOs ─────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailSenderDto {
        private String name;
        private String email;
        private String avatar;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThreadMessageDto {
        private String id;
        private EmailSenderDto sender;
        private List<String> recipients;
        private List<String> cc;
        private List<String> bcc;
        private String timestamp;
        private String fullDate;
        private String body;
        private List<AttachmentDto> attachments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentDto {
        private String id;
        private String name;
        private String size;
        /** One of: image | pdf | document | spreadsheet | archive */
        private String type;
        private String url;
    }
}
