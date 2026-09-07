package com.mailapp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiContext(
        String currentView,
        SelectedEmail selectedEmail,
        EmailSummary latestEmail,
        List<EmailSummary> visibleEmails,
        String mailboxMode,
        Map<String, Object> activeFilters) {

    // 3-arg constructor for backward compatibility with existing tests and calls
    public AiContext(String currentView, SelectedEmail selectedEmail, Map<String, Object> activeFilters) {
        this(currentView, selectedEmail, null, List.of(), "REAL_GMAIL", activeFilters);
    }

    public AiContext normalized() {
        return new AiContext(
                currentView == null || currentView.isBlank() ? "INBOX" : currentView,
                selectedEmail,
                latestEmail,
                visibleEmails == null ? List.of() : Collections.unmodifiableList(visibleEmails),
                mailboxMode == null || mailboxMode.isBlank() ? "REAL_GMAIL" : mailboxMode,
                activeFilters == null ? Map.of() : Collections.unmodifiableMap(new java.util.HashMap<>(activeFilters)));
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SelectedEmail(
            String id,
            String from,
            String to,
            String subject,
            String snippet) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EmailSummary(
            String id,
            String from,
            String subject,
            String snippet,
            String timestamp) {
    }
}
