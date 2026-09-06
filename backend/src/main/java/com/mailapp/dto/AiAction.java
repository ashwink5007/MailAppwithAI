package com.mailapp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiAction(String type, Map<String, Object> payload) {
    public AiAction normalized() {
        return new AiAction(type == null ? "UNKNOWN" : type.trim().toUpperCase(),
                payload == null ? Map.of() : java.util.Collections.unmodifiableMap(new java.util.HashMap<>(payload)));
    }
}
