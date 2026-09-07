package com.mailapp.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mailapp.dto.AiCommandRequest;
import com.mailapp.dto.AiContext;
import com.mailapp.exception.AiException;
import com.mailapp.service.GeminiClient;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiServiceImplTest {

    private final GeminiClient geminiClient = mock(GeminiClient.class);
    private final AiServiceImpl service = new AiServiceImpl(geminiClient, new ObjectMapper());

    @Test
    void acceptsSupportedFilterAction() {
        when(geminiClient.generateAction(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("{\"type\":\"FILTER_EMAILS\",\"payload\":{\"unread\":true,\"dateRange\":\"THIS_WEEK\"}}");

        var response = service.interpret(new AiCommandRequest("Show unread emails from this week", null));

        assertEquals("FILTER_EMAILS", response.action().type());
        assertEquals(true, response.action().payload().get("unread"));
    }

    @Test
    void preparesReplyOnlyForSelectedEmail() {
        when(geminiClient.generateAction(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("{\"type\":\"PREPARE_REPLY\",\"payload\":{}}");
        AiContext context = new AiContext(
                "EMAIL_DETAIL",
                new AiContext.SelectedEmail("gmail-123", "sender@example.com", "me@example.com", "Update", "Snippet"),
                Map.of());

        var response = service.interpret(new AiCommandRequest("Reply to this", context));

        assertEquals("PREPARE_REPLY", response.action().type());
        assertEquals("gmail-123", response.action().payload().get("emailId"));
    }

    @Test
    void convertsReplyWithoutSelectedEmailToUnknown() {
        when(geminiClient.generateAction(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("{\"type\":\"PREPARE_REPLY\",\"payload\":{}}");

        var response = service.interpret(new AiCommandRequest("Reply to this", null));

        assertEquals("UNKNOWN", response.action().type());
    }

    @Test
    void resolvesLatestEmailReference() {
        when(geminiClient.generateAction(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("{\"type\":\"OPEN_EMAIL\",\"payload\":{}}");

        AiContext context = new AiContext(
                "INBOX",
                null,
                new AiContext.EmailSummary("demo-latest-42", "sarah@nebula.io", "Latest Update", "Preview", "10:00 AM"),
                List.of(),
                "DEMO",
                Map.of());

        var response = service.interpret(new AiCommandRequest("Open the latest email", context));

        assertEquals("OPEN_EMAIL", response.action().type());
        assertEquals("demo-latest-42", response.action().payload().get("emailId"));
    }

    @Test
    void convertsSummarizeWithoutSelectedEmailToUnknown() {
        when(geminiClient.generateAction(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("{\"type\":\"SUMMARIZE_EMAIL\",\"payload\":{}}");

        var response = service.interpret(new AiCommandRequest("Summarize this email", null));

        assertEquals("UNKNOWN", response.action().type());
        assertTrue(response.action().payload().containsKey("reason"));
    }

    @Test
    void rejectsUnsupportedAction() {
        when(geminiClient.generateAction(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("{\"type\":\"DELETE_EMAILS\",\"payload\":{}}");

        assertThrows(AiException.class,
                () -> service.interpret(new AiCommandRequest("Delete everything", null)));
    }

    @Test
    void rejectsBlankMessage() {
        assertThrows(IllegalArgumentException.class,
                () -> service.interpret(new AiCommandRequest("   ", null)));
    }
}
