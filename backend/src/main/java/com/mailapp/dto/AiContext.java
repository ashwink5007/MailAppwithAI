package com.mailapp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiContext(
        String currentView,
        SelectedEmail selectedEmail,
        Map<String, Object> activeFilters) {

    public AiContext normalized() {
        return new AiContext(
                currentView == null || currentView.isBlank() ? "INBOX" : currentView,
                selectedEmail,
                activeFilters == null ? Map.of() : java.util.Collections.unmodifiableMap(new java.util.HashMap<>(activeFilters)));
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SelectedEmail(
            String id,
            String from,
            String to,
            String subject,
            String snippet) {
    }
}
