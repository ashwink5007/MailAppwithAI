package com.mailapp.service.impl;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePart;
import com.google.api.services.gmail.model.MessagePartHeader;
import com.google.api.services.gmail.model.ModifyMessageRequest;
import com.mailapp.dto.ReplyEmailRequest;
import com.mailapp.dto.SendEmailRequest;
import com.mailapp.dto.EmailDto;
import com.mailapp.dto.EmailDto.EmailSenderDto;
import com.mailapp.dto.EmailDto.ThreadMessageDto;
import com.mailapp.exception.ResourceNotFoundException;
import com.mailapp.service.EmailService;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import jakarta.mail.Message.RecipientType;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.util.Properties;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * EmailService implementation backed by the real Gmail API.
 *
 * Uses the OAuth2 access token stored by Spring Security after the user
 * authenticates with Google to call the Gmail REST API on their behalf.
 *
 * MIME parsing strategy:
 *   - Walk the message parts tree to find text/html first, then text/plain.
 *   - Decode the selected part from Base64url encoding.
 *   - Extract standard headers (From, To, Cc, Bcc, Subject, Date).
 *
 * Missing OAuth sessions and Gmail failures are returned as API errors rather
 * than being replaced with mock data.
 */
@Service
@Primary
public class GmailApiServiceImpl implements EmailService {

    private static final int MAX_RESULTS = 50;
    private static final String APPLICATION_NAME = "AiMail";

    private final OAuth2AuthorizedClientService authorizedClientService;
    public GmailApiServiceImpl(
            OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    // ── Gmail client ────────────────────────────────────────────────────────

    /**
     * Builds a Gmail API client using the authenticated user's OAuth2 access token.
     * Returns null if the current principal is not a Google OAuth2 user.
     */
    private Gmail getGmailService() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            return null;
        }

        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(),
                oauthToken.getName());

        if (client == null || client.getAccessToken() == null) {
            return null;
        }

        String accessToken = client.getAccessToken().getTokenValue();
        HttpRequestInitializer requestInitializer =
                request -> request.getHeaders().setAuthorization("Bearer " + accessToken);

        try {
            return new Gmail.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    requestInitializer)
                    .setApplicationName(APPLICATION_NAME)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialise Gmail API client", e);
        }
    }

    /** Returns the authenticated user's email address from the OAuth2 principal. */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User principal = oauthToken.getPrincipal();
            String email = principal.getAttribute("email");
            return email != null ? email : "me";
        }
        return "me";
    }

    @Override
    public String sendEmail(SendEmailRequest request) {
        Gmail service = requireGmailService();
        try {
            MimeMessage mimeMessage = createMimeMessage(
                    request.to(), request.cc(), request.bcc(), request.subject(), request.body(), null, null);
            String messageId = sendMimeMessage(service, mimeMessage, null);
            System.out.println("Gmail message sent successfully. Message ID: " + messageId);
            return messageId;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send email through Gmail", e);
        }
    }

    @Override
    public String sendReply(String id, ReplyEmailRequest request) {
        Gmail service = requireGmailService();
        try {
            Message original = service.users().messages().get("me", id).setFormat("full").execute();
            Map<String, String> headers = extractHeaders(original);
            String replyTo = headers.get("Reply-To");
            String targetAddress = (replyTo != null && !replyTo.isBlank()) ? replyTo : headers.get("From");
            if (targetAddress == null || targetAddress.isBlank()) {
                throw new IllegalArgumentException("The original email has no sender address");
            }
            String references = headers.get("References");
            String messageIdHeader = headers.get("Message-ID");
            String combinedReferences = references == null || references.isBlank()
                    ? messageIdHeader
                    : (messageIdHeader == null || messageIdHeader.isBlank()
                        ? references
                        : references + " " + messageIdHeader);
            MimeMessage reply = createMimeMessage(
                    extractAddress(targetAddress), null, null,
                    replySubject(headers.get("Subject")), request.body(),
                    messageIdHeader, combinedReferences);
            String sentMessageId = sendMimeMessage(service, reply, original.getThreadId());
            System.out.println("Reply sent successfully. Original message ID: " + id
                    + ", recipient: " + extractAddress(targetAddress));
            return sentMessageId;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send reply through Gmail", e);
        }
    }

    @Override
    public void markAsRead(String id) {
        Gmail service = requireGmailService();
        try {
            Message message = service.users().messages().get("me", id).setFields("threadId").execute();
            if (message.getThreadId() != null) {
                System.out.println("Marking Gmail thread as read. Thread ID: " + message.getThreadId());
                service.users().threads().modify("me", message.getThreadId(),
                        new com.google.api.services.gmail.model.ModifyThreadRequest().setRemoveLabelIds(List.of("UNREAD"))).execute();
            } else {
                System.out.println("Marking Gmail message as read. Message ID: " + id);
                service.users().messages().modify("me", id,
                        new ModifyMessageRequest().setRemoveLabelIds(List.of("UNREAD"))).execute();
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to mark email as read through Gmail", e);
        }
    }

    @Override
    public void moveToTrash(String id) {
        Gmail service = requireGmailService();
        try {
            Message message = service.users().messages().get("me", id).setFields("threadId").execute();
            if (message.getThreadId() != null) {
                System.out.println("Moving Gmail thread to trash. Thread ID: " + message.getThreadId());
                service.users().threads().trash("me", message.getThreadId()).execute();
            } else {
                System.out.println("Moving Gmail message to trash. Message ID: " + id);
                service.users().messages().trash("me", id).execute();
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to move email to trash through Gmail", e);
        }
    }

    private Gmail requireGmailService() {
        Gmail service = getGmailService();
        if (service == null) {
            throw new IllegalStateException("No authenticated Gmail session is available");
        }
        return service;
    }

    private MimeMessage createMimeMessage(
            String to,
            String cc,
            String bcc,
            String subject,
            String body,
            String inReplyTo,
            String references) throws Exception {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        message.setFrom(new InternetAddress(getCurrentUserEmail()));
        message.setRecipient(RecipientType.TO, new InternetAddress(to));
        addRecipients(message, RecipientType.CC, cc);
        addRecipients(message, RecipientType.BCC, bcc);
        message.setSubject(subject == null ? "" : subject, StandardCharsets.UTF_8.name());
        message.setText(body, StandardCharsets.UTF_8.name());
        if (inReplyTo != null && !inReplyTo.isBlank()) message.setHeader("In-Reply-To", inReplyTo);
        if (references != null && !references.isBlank()) message.setHeader("References", references);
        return message;
    }

    private void addRecipients(MimeMessage message, RecipientType type, String addresses) throws Exception {
        if (addresses != null && !addresses.isBlank()) {
            message.setRecipients(type, InternetAddress.parse(addresses));
        }
    }

    private String sendMimeMessage(Gmail service, MimeMessage mimeMessage, String threadId) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        mimeMessage.writeTo(output);
        String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(output.toByteArray());
        Message gmailMessage = new Message().setRaw(encoded);
        if (threadId != null && !threadId.isBlank()) gmailMessage.setThreadId(threadId);
        System.out.println("Calling Gmail API messages.send");
        Message response = service.users().messages().send("me", gmailMessage).execute();
        if (response == null || response.getId() == null || response.getId().isBlank()) {
            throw new IllegalStateException("Gmail did not return a message ID");
        }
        return response.getId();
    }

    private String extractAddress(String header) {
        try {
            InternetAddress[] addresses = InternetAddress.parse(header);
            if (addresses.length == 0 || addresses[0].getAddress() == null) {
                throw new IllegalArgumentException("Invalid original sender address");
            }
            return addresses[0].getAddress();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid original sender address", e);
        }
    }

    private String replySubject(String subject) {
        if (subject == null || subject.isBlank()) return "Re:";
        return subject.regionMatches(true, 0, "Re:", 0, 3) ? subject : "Re: " + subject;
    }

    // ── EmailService implementation ─────────────────────────────────────────

    @Override
    public List<EmailDto> getAllEmails() {
        Gmail service = getGmailService();
        if (service == null) throw new IllegalStateException("No authenticated Gmail session is available");
        try {
            // Fetch across all labels — inbox + sent combined gives "All Mail" view
            List<EmailDto> inbox = fetchMessages(service, "INBOX", MAX_RESULTS / 2);
            List<EmailDto> sent  = fetchMessages(service, "SENT",  MAX_RESULTS / 2);
            List<EmailDto> all   = new ArrayList<>();
            all.addAll(inbox);
            all.addAll(sent);
            return all;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load emails from Gmail", e);
        }
    }

    @Override
    public List<EmailDto> getInboxEmails() {
        Gmail service = getGmailService();
        if (service == null) throw new IllegalStateException("No authenticated Gmail session is available");
        try {
            return fetchMessages(service, "INBOX", MAX_RESULTS);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load inbox emails from Gmail", e);
        }
    }

    @Override
    public List<EmailDto> getSentEmails() {
        Gmail service = getGmailService();
        if (service == null) throw new IllegalStateException("No authenticated Gmail session is available");
        try {
            return fetchMessages(service, "SENT", MAX_RESULTS);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load sent emails from Gmail", e);
        }
    }

    @Override
    public EmailDto getEmailById(String id) {
        Gmail service = getGmailService();
        if (service == null) throw new IllegalStateException("No authenticated Gmail session is available");
        try {
            Message message = service.users().messages()
                    .get("me", id)
                    .setFormat("full")
                    .execute();
            if (message == null) {
                throw new ResourceNotFoundException("Email", id);
            }
            return mapMessageToDto(message, deriveFolder(message));
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load email from Gmail", e);
        }
    }

    // ── Gmail fetching helpers ──────────────────────────────────────────────

    /**
     * Lists message IDs for a label, then batch-fetches full messages.
     *
     * @param labelId Gmail system label, e.g. "INBOX" or "SENT"
     * @param limit   max messages to fetch
     */
    private List<EmailDto> fetchMessages(Gmail service, String labelId, int limit) throws Exception {
        ListMessagesResponse listResponse = service.users().messages()
                .list("me")
                .setLabelIds(Collections.singletonList(labelId))
                .setMaxResults((long) limit)
                .execute();

        List<Message> messages = listResponse.getMessages();
        if (messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }

        String folder = labelId.equals("SENT") ? "sent" : "inbox";
        
        return messages.parallelStream()
                .map(stub -> {
                    try {
                        Message full = service.users().messages()
                                .get("me", stub.getId())
                                .setFormat("full")
                                .execute();
                        return mapMessageToDto(full, folder);
                    } catch (Exception e) {
                        System.err.println("Failed to fetch message " + stub.getId() + ": " + e.getMessage());
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
    }

    // ── MIME mapping ────────────────────────────────────────────────────────

    /**
     * Maps a fully-fetched Gmail {@link Message} to our {@link EmailDto}.
     *
     * @param message full Gmail message with payload and headers
     * @param folder  folder string to assign (e.g. "inbox", "sent")
     */
    private EmailDto mapMessageToDto(Message message, String folder) {
        Map<String, String> headers = extractHeaders(message);

        String from      = headers.getOrDefault("From", "Unknown <unknown@gmail.com>");
        String to        = headers.getOrDefault("To", "");
        String cc        = headers.getOrDefault("Cc", "");
        String subject   = headers.getOrDefault("Subject", "(no subject)");
        String dateHeader = headers.getOrDefault("Date", "");

        EmailSenderDto sender = parseSender(from);
        List<String> recipients = parseAddressList(to);
        List<String> ccList  = parseAddressList(cc);

        String body    = extractBody(message.getPayload());
        String snippet = message.getSnippet() != null ? message.getSnippet() : "";
        String timestamp = formatTimestamp(message.getInternalDate());
        String fullDate  = formatFullDate(message.getInternalDate());

        // Determine flags from Gmail label IDs
        List<String> labelIds = message.getLabelIds() != null ? message.getLabelIds() : List.of();
        boolean isRead      = !labelIds.contains("UNREAD");
        boolean isStarred   = labelIds.contains("STARRED");
        boolean isImportant = labelIds.contains("IMPORTANT");

        // Build the single thread message (full body)
        ThreadMessageDto threadMsg = ThreadMessageDto.builder()
                .id(message.getId())
                .sender(sender)
                .recipients(recipients)
                .cc(ccList.isEmpty() ? null : ccList)
                .timestamp(timestamp)
                .fullDate(fullDate)
                .body(body)
                .build();

        return EmailDto.builder()
                .id(message.getId())
                .sender(sender)
                .recipients(recipients)
                .subject(subject)
                .snippet(snippet)
                .timestamp(timestamp)
                .fullDate(fullDate)
                .isRead(isRead)
                .isStarred(isStarred)
                .isImportant(isImportant)
                .folder(folder)
                .labels(List.of())
                .thread(List.of(threadMsg))
                .attachments(List.of())
                .needsResponse(false)
                .build();
    }

    /** Derives a folder name from Gmail label IDs on the message. */
    private String deriveFolder(Message message) {
        if (message.getLabelIds() == null) return "inbox";
        List<String> labels = message.getLabelIds();
        if (labels.contains("SENT"))      return "sent";
        if (labels.contains("DRAFT"))     return "drafts";
        if (labels.contains("SPAM"))      return "spam";
        if (labels.contains("TRASH"))     return "trash";
        if (labels.contains("INBOX"))     return "inbox";
        return "inbox";
    }

    // ── Header parsing ──────────────────────────────────────────────────────

    /** Extracts all message headers into a simple name → value map. */
    private Map<String, String> extractHeaders(Message message) {
        if (message.getPayload() == null || message.getPayload().getHeaders() == null) {
            return Map.of();
        }
        java.util.HashMap<String, String> map = new java.util.HashMap<>();
        for (MessagePartHeader header : message.getPayload().getHeaders()) {
            map.put(header.getName(), header.getValue());
        }
        return map;
    }

    /**
     * Parses a "Display Name <email@example.com>" string into an {@link EmailSenderDto}.
     * Falls back gracefully if the format is just "email@example.com".
     */
    private EmailSenderDto parseSender(String from) {
        if (from == null || from.isBlank()) {
            return EmailSenderDto.builder().name("Unknown").email("unknown@gmail.com").build();
        }
        int lt = from.indexOf('<');
        int gt = from.indexOf('>');
        if (lt >= 0 && gt > lt) {
            String name  = from.substring(0, lt).trim().replace("\"", "");
            String email = from.substring(lt + 1, gt).trim();
            if (name.isBlank()) name = email;
            String avatar = "https://api.dicebear.com/7.x/initials/svg?seed="
                    + java.net.URLEncoder.encode(name, StandardCharsets.UTF_8)
                    + "&backgroundColor=2563eb&textColor=ffffff";
            return EmailSenderDto.builder().name(name).email(email).avatar(avatar).build();
        }
        // Plain email address only
        String avatar = "https://api.dicebear.com/7.x/initials/svg?seed="
                + java.net.URLEncoder.encode(from, StandardCharsets.UTF_8)
                + "&backgroundColor=2563eb&textColor=ffffff";
        return EmailSenderDto.builder().name(from).email(from).avatar(avatar).build();
    }

    /**
     * Splits a comma-separated address list and returns just the email addresses.
     */
    private List<String> parseAddressList(String header) {
        if (header == null || header.isBlank()) return List.of();
        List<String> result = new ArrayList<>();
        for (String part : header.split(",")) {
            part = part.trim();
            int lt = part.indexOf('<');
            int gt = part.indexOf('>');
            if (lt >= 0 && gt > lt) {
                result.add(part.substring(lt + 1, gt).trim());
            } else if (!part.isBlank()) {
                result.add(part);
            }
        }
        return result;
    }

    // ── Body extraction ─────────────────────────────────────────────────────

    /**
     * Walks the MIME part tree and returns the decoded body.
     * Preference order: text/html → text/plain → snippet fallback.
     */
    private String extractBody(MessagePart part) {
        if (part == null) return "";

        // Leaf part — try to decode directly
        String mimeType = part.getMimeType() != null ? part.getMimeType().toLowerCase(Locale.ROOT) : "";
        if (part.getBody() != null && part.getBody().getData() != null) {
            if (mimeType.contains("text/html") || mimeType.contains("text/plain")) {
                return decodeBase64Url(part.getBody().getData());
            }
        }

        if (part.getParts() == null) return "";

        // Prefer HTML body when both text/html and text/plain are present
        String htmlBody  = null;
        String plainBody = null;

        for (MessagePart child : part.getParts()) {
            String childMime = child.getMimeType() != null
                    ? child.getMimeType().toLowerCase(Locale.ROOT) : "";

            if (childMime.startsWith("text/html")) {
                htmlBody = extractBody(child);
            } else if (childMime.startsWith("text/plain")) {
                plainBody = extractBody(child);
            } else if (childMime.startsWith("multipart/")) {
                // Recurse into nested multipart
                String nested = extractBody(child);
                if (!nested.isBlank()) {
                    if (htmlBody == null) htmlBody = nested;
                }
            }
        }

        if (htmlBody  != null && !htmlBody.isBlank())  return htmlBody;
        if (plainBody != null && !plainBody.isBlank()) return plainBody;
        return "";
    }

    /** Decodes Gmail's Base64url-encoded body data. */
    private String decodeBase64Url(String data) {
        if (data == null || data.isBlank()) return "";
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(data.replace("-", "+").replace("_", "/"));
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
    }

    // ── Timestamp formatting ────────────────────────────────────────────────

    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH).withZone(ZoneId.systemDefault());
    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH).withZone(ZoneId.systemDefault());
    private static final DateTimeFormatter FULL_FMT =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a", Locale.ENGLISH)
                    .withZone(ZoneId.systemDefault());

    /**
     * Returns a short human-readable timestamp: "10:45 AM" for today, "Sep 3" otherwise.
     */
    private String formatTimestamp(Long internalDate) {
        if (internalDate == null) return "";
        Instant instant = Instant.ofEpochMilli(internalDate);
        Instant dayStart = Instant.now().atZone(ZoneId.systemDefault())
                .toLocalDate().atStartOfDay(ZoneId.systemDefault()).toInstant();
        return instant.isAfter(dayStart)
                ? TIME_FMT.format(instant)
                : DATE_FMT.format(instant);
    }

    /**
     * Returns a full human-readable date: "Saturday, September 3, 2026 at 10:45 AM".
     */
    private String formatFullDate(Long internalDate) {
        if (internalDate == null) return "";
        return FULL_FMT.format(Instant.ofEpochMilli(internalDate));
    }
}
