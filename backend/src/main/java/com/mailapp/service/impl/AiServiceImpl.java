package com.mailapp.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mailapp.dto.AiAction;
import com.mailapp.dto.AiCommandRequest;
import com.mailapp.dto.AiCommandResponse;
import com.mailapp.dto.AiContext;
import com.mailapp.exception.AiException;
import com.mailapp.service.AiService;
import com.mailapp.service.GeminiClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class AiServiceImpl implements AiService {

    private static final Set<String> SUPPORTED_ACTIONS = Set.of(
            "OPEN_COMPOSE", "FILL_COMPOSE", "SEARCH_EMAILS", "FILTER_EMAILS",
            "OPEN_EMAIL", "PREPARE_REPLY", "NAVIGATE", "MARK_READ", "MARK_UNREAD",
            "STAR_EMAIL", "UNSTAR_EMAIL", "MOVE_EMAIL", "DELETE_EMAIL", "SUMMARIZE_EMAIL", "UNKNOWN");

    private static final Set<String> SUPPORTED_VIEWS = Set.of(
            "INBOX", "SENT", "COMPOSE", "EMAIL_DETAIL", "DRAFTS", "STARRED", "IMPORTANT", "SPAM", "TRASH");

    private static final Set<String> SUPPORTED_DATE_RANGES = Set.of(
            "TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_10_DAYS", "THIS_WEEK",
            "LAST_WEEK", "THIS_MONTH");

    private static final String SYSTEM_INSTRUCTION = """
            You are an expert AI Copilot for NebulaMail, an intelligent email workspace.
            Your job is to understand natural human language semantically (including synonyms, polite requests, conversational phrasing, and implicit intent) and map the user's intent to exactly one executable structured action.
            
            CRITICAL RULES:
            1. Return ONLY pure valid JSON without markdown formatting or conversational text:
               {"type": "ACTION_TYPE", "payload": {}}
            2. Never invent email IDs, recipients, or email contents that are not in the user request or application context.
            3. Context Reference Resolution:
               - If the user refers to "this email", "that message", "the email I'm reading", or "reply to this/him/her", you MUST use the currently selected email from context (selectedEmail). If selectedEmail is null or missing, return UNKNOWN explaining that no email is currently open or selected.
               - If the user refers to "the latest email", "the latest one", or "most recent message", use latestEmail from context (or the first email in visibleEmails). If not available, return UNKNOWN.
               - If the user asks ambiguous commands like "open it", "reply to him", or "delete that" with no selected email and no unambiguous target, return UNKNOWN. Never guess!
            4. Support the following action types:
               - OPEN_COMPOSE: User wants to compose/write/start a new email without details. Payload: {}
               - FILL_COMPOSE: User wants to compose an email with details (to, subject, body). Payload: {"to":"...", "subject":"...", "body":"..."} (only include fields provided by the user).
               - SEARCH_EMAILS: User wants to search emails by query keyword or phrase (e.g. "search invoices", "find John's messages", "find emails about roadmap"). Payload: {"query": "..."}
               - FILTER_EMAILS: User wants to filter the email list (e.g. unread emails, from a sender, or in a date range).
                 Payload: {"unread": true/false, "sender": "...", "keyword": "...", "dateRange": "..."}
                 Use "unread": true when user asks for unread messages ("what haven't I read?", "show unread mail").
                 Supported dateRange values: TODAY, YESTERDAY, THIS_WEEK, LAST_WEEK, THIS_MONTH, LAST_7_DAYS, LAST_10_DAYS.
               - OPEN_EMAIL: User wants to open or read a specific email (e.g. "open the latest email", "show me that email", "open email from Sarah").
                 Payload: {"emailId": "..."} if known from context, or {"sender": "...", "keyword": "..."}.
               - PREPARE_REPLY: User wants to reply to the currently open/selected email.
                 Payload: {"emailId": "..."}. Return UNKNOWN if selectedEmail is null.
               - SUMMARIZE_EMAIL: User wants a summary of the currently selected email ("summarize this", "give me the key points").
                 Payload: {"emailId": "..."}. Return UNKNOWN if selectedEmail is null.
               - MARK_READ: User wants to mark an email as read ("mark this as read", "mark as read"). Payload: {"emailId": "..."}
               - MARK_UNREAD: User wants to mark an email as unread ("mark this unread"). Payload: {"emailId": "..."}
               - STAR_EMAIL: User wants to star the email ("star this email", "favorite this"). Payload: {"emailId": "..."}
               - UNSTAR_EMAIL: User wants to unstar the email ("unstar this email"). Payload: {"emailId": "..."}
               - DELETE_EMAIL: User wants to delete/trash the email ("delete this email", "move this to trash"). Payload: {"emailId": "..."}. Return UNKNOWN if selectedEmail is null.
               - NAVIGATE: User wants to switch folders (inbox, sent, drafts, starred, important, spam, trash).
                 Payload: {"view": "INBOX" | "SENT" | "DRAFTS" | "STARRED" | "IMPORTANT" | "SPAM" | "TRASH" | "COMPOSE"}
               - UNKNOWN: The request is ambiguous, conversational without an action, or missing required context.
                 Payload: {"reason": "Friendly explanation or clarification question"}
            """;

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public AiServiceImpl(GeminiClient geminiClient, ObjectMapper objectMapper) {
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public AiCommandResponse interpret(AiCommandRequest request) {
        if (request == null || request.message() == null || request.message().isBlank()) {
            throw new IllegalArgumentException("Message is required");
        }

        AiContext context = request.context() == null ? new AiContext("INBOX", null, Map.of()).normalized() : request.context().normalized();
        String prompt = buildPrompt(request.message().trim(), context);
        String rawResponse = geminiClient.generateAction(SYSTEM_INSTRUCTION, prompt);
        AiAction action = parseAction(rawResponse);
        return new AiCommandResponse(validateAction(action, context, request.message().trim()));
    }

    private String buildPrompt(String message, AiContext context) {
        try {
            return "Application context:\n" + objectMapper.writeValueAsString(context)
                    + "\n\nUser request:\n" + message;
        } catch (Exception e) {
            throw new AiException("Unable to build AI context", e);
        }
    }

    private AiAction parseAction(String rawResponse) {
        try {
            String json = rawResponse.trim();
            if (json.startsWith("```")) {
                json = json.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "").trim();
            }
            return objectMapper.readValue(json, AiAction.class).normalized();
        } catch (Exception e) {
            System.err.println("Gemini returned unparseable response: " + rawResponse);
            throw new AiException("Gemini returned invalid structured output: " + e.getMessage(), e);
        }
    }

    private AiAction validateAction(AiAction action, AiContext context, String userMessage) {
        if (!SUPPORTED_ACTIONS.contains(action.type())) {
            throw new AiException("Gemini returned an unsupported action");
        }

        Map<String, Object> payload = new HashMap<>(action.payload() != null ? action.payload() : Map.of());
        String lowerMsg = userMessage.toLowerCase();

        // Check reference resolution for actions targeting the selected email
        if ("PREPARE_REPLY".equals(action.type())) {
            if (context.selectedEmail() == null || context.selectedEmail().id() == null || context.selectedEmail().id().isBlank()) {
                return new AiAction("UNKNOWN", Map.of("reason", "No email is currently open. Please open an email first to draft a reply."));
            }
            payload.put("emailId", context.selectedEmail().id());
            return new AiAction("PREPARE_REPLY", payload);
        }

        if ("SUMMARIZE_EMAIL".equals(action.type())) {
            if (context.selectedEmail() == null || context.selectedEmail().id() == null || context.selectedEmail().id().isBlank()) {
                return new AiAction("UNKNOWN", Map.of("reason", "No email is currently selected. Please select an email first to summarize it."));
            }
            payload.put("emailId", context.selectedEmail().id());
            return new AiAction("SUMMARIZE_EMAIL", payload);
        }

        if ("DELETE_EMAIL".equals(action.type())) {
            if (payload.get("emailId") == null || String.valueOf(payload.get("emailId")).isBlank()) {
                if (context.selectedEmail() != null && context.selectedEmail().id() != null) {
                    payload.put("emailId", context.selectedEmail().id());
                } else {
                    return new AiAction("UNKNOWN", Map.of("reason", "No email is currently selected to delete. Please select an email first."));
                }
            }
            return new AiAction("DELETE_EMAIL", payload);
        }

        if ("OPEN_EMAIL".equals(action.type())) {
            // Check if user specifically requested "latest" / "most recent"
            if ((lowerMsg.contains("latest") || lowerMsg.contains("most recent") || lowerMsg.contains("newest"))
                    && context.latestEmail() != null) {
                payload.put("emailId", context.latestEmail().id());
            } else if (lowerMsg.contains("this") || lowerMsg.contains("that")) {
                if (context.selectedEmail() != null && context.selectedEmail().id() != null) {
                    payload.put("emailId", context.selectedEmail().id());
                } else if (context.latestEmail() != null) {
                    payload.put("emailId", context.latestEmail().id());
                } else {
                    return new AiAction("UNKNOWN", Map.of("reason", "Which email would you like to open? You can specify a sender or search keyword."));
                }
            }
            return new AiAction("OPEN_EMAIL", payload);
        }

        if ("NAVIGATE".equals(action.type())) {
            String view = stringValue(payload.get("view"));
            if (!SUPPORTED_VIEWS.contains(view)) {
                throw new AiException("Gemini returned an invalid navigation view");
            }
        }

        if ("FILTER_EMAILS".equals(action.type()) && payload.containsKey("dateRange")) {
            String dateRange = stringValue(payload.get("dateRange"));
            if (!SUPPORTED_DATE_RANGES.contains(dateRange)) {
                throw new AiException("Gemini returned an invalid date range");
            }
        }

        return new AiAction(action.type(), payload);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim().toUpperCase();
    }
}
