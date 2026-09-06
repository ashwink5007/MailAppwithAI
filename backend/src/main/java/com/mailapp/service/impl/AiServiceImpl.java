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

import java.util.Map;
import java.util.Set;

@Service
public class AiServiceImpl implements AiService {

    private static final Set<String> SUPPORTED_ACTIONS = Set.of(
            "OPEN_COMPOSE", "FILL_COMPOSE", "SEARCH_EMAILS", "FILTER_EMAILS",
            "OPEN_EMAIL", "PREPARE_REPLY", "NAVIGATE", "UNKNOWN");
    private static final Set<String> SUPPORTED_VIEWS = Set.of("INBOX", "SENT", "COMPOSE", "EMAIL_DETAIL");
    private static final Set<String> SUPPORTED_DATE_RANGES = Set.of(
            "TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_10_DAYS", "THIS_WEEK",
            "LAST_WEEK", "THIS_MONTH");

    private static final String SYSTEM_INSTRUCTION = """
            You are an advanced AI Copilot for an email application.
            Your job is to understand natural human language and map the user's request to exactly one structured action.
            You do not execute actions yourself. You only determine intent and extract relevant parameters.
            
            Return ONLY valid JSON with this shape: {"type":"ACTION_TYPE","payload":{}}
            
            Supported actions:
            - OPEN_COMPOSE: User wants to write a new email. Payload: {}
            - FILL_COMPOSE: User provides details (to, subject, body) to draft a new email. Payload: {"to":"...","subject":"...","body":"..."}
            - SEARCH_EMAILS: User wants to search by a generic query. Payload: {"query":"..."} or {"keyword":"..."}
            - FILTER_EMAILS: User asks to see emails from someone, with a keyword, or in a date range. Payload: {"unread":true,"sender":"...","keyword":"...","dateRange":"..."}
            - OPEN_EMAIL: User wants to open a specific email. Payload: {"emailId":"..."} or {"sender":"...","keyword":"..."}
            - PREPARE_REPLY: User wants to reply to the currently selected email. Return UNKNOWN if none is selected.
            - NAVIGATE: User wants to go to INBOX, SENT, or COMPOSE. Payload: {"view":"INBOX"} or {"view":"SENT"} or {"view":"COMPOSE"}
            - UNKNOWN: Request is ambiguous, conversational but unactionable, or unsupported. Payload: {"reason":"..."}
            
            For FILTER_EMAILS, use the key "unread" (not "isUnread") when filtering unread emails.
            
            Supported navigation views: INBOX, SENT, COMPOSE.
            Supported date ranges: TODAY, YESTERDAY, LAST_7_DAYS, LAST_10_DAYS, THIS_WEEK, LAST_WEEK, THIS_MONTH.
            
            Examples of natural language mapping:
            - "Draft a quick response to this" -> {"type":"PREPARE_REPLY","payload":{}}
            - "Show me emails from Alice" -> {"type":"FILTER_EMAILS","payload":{"sender":"Alice"}}
            - "What did my boss say last week?" -> {"type":"FILTER_EMAILS","payload":{"dateRange":"LAST_WEEK"}}
            - "Show unread emails from this week" -> {"type":"FILTER_EMAILS","payload":{"unread":true,"dateRange":"THIS_WEEK"}}
            - "Let's write a new email to Bob" -> {"type":"FILL_COMPOSE","payload":{"to":"Bob"}}
            - "Go to my sent folder" -> {"type":"NAVIGATE","payload":{"view":"SENT"}}
            - "Archive promotional emails" -> {"type":"FILTER_EMAILS","payload":{"keyword":"promotions"}}
            - "Hello AI!" -> {"type":"UNKNOWN","payload":{"reason":"I can help you manage your emails. What would you like to do?"}}
            
            Never invent email IDs or addresses if not provided. Always extract the most logical intent from conversational language.
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

        AiContext context = request.context() == null ? new AiContext("INBOX", null, Map.of()) : request.context().normalized();
        String prompt = buildPrompt(request.message().trim(), context);
        String rawResponse = geminiClient.generateAction(SYSTEM_INSTRUCTION, prompt);
        AiAction action = parseAction(rawResponse);
        return new AiCommandResponse(validateAction(action, context));
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
            // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
            if (json.startsWith("```")) {
                json = json.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "").trim();
            }
            return objectMapper.readValue(json, AiAction.class).normalized();
        } catch (Exception e) {
            System.err.println("Gemini returned unparseable response: " + rawResponse);
            throw new AiException("Gemini returned invalid structured output: " + e.getMessage(), e);
        }
    }

    private AiAction validateAction(AiAction action, AiContext context) {
        if (!SUPPORTED_ACTIONS.contains(action.type())) {
            throw new AiException("Gemini returned an unsupported action");
        }

        Map<String, Object> payload = action.payload();
        if ("PREPARE_REPLY".equals(action.type())) {
            if (context.selectedEmail() == null || context.selectedEmail().id() == null
                    || context.selectedEmail().id().isBlank()) {
                return new AiAction("UNKNOWN", Map.of("reason", "No email is currently open"));
            }
            return new AiAction("PREPARE_REPLY", Map.of("emailId", context.selectedEmail().id()));
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

        return action;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim().toUpperCase();
    }
}
