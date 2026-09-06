package com.mailapp.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mailapp.exception.AiException;
import com.mailapp.service.GeminiClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeminiClientImpl implements GeminiClient {

    private static final String API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final String DEFAULT_MODEL = "gemini-3.6-flash";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;

    public GeminiClientImpl(
            ObjectMapper objectMapper,
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:}") String model) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model == null || model.isBlank() ? DEFAULT_MODEL : model.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public String generateAction(String systemInstruction, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiException("Gemini is not configured on the backend");
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", userPrompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0.1,
                            "responseMimeType", "application/json"));

            String body = objectMapper.writeValueAsString(requestBody);
            URI endpoint = URI.create(API_BASE_URL + model + ":generateContent");
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            System.out.println("Calling Gemini API");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Gemini API response status: " + response.statusCode());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("Gemini API error body: " + response.body());
                throw new AiException(formatProviderError(response.statusCode(), response.body()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (!text.isTextual() || text.asText().isBlank()) {
                throw new AiException("Gemini returned an empty response");
            }
            System.out.println("Received AI response");
            return text.asText();
        } catch (AiException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AiException("Gemini request was interrupted", e);
        } catch (Exception e) {
            throw new AiException("Unable to communicate with Gemini", e);
        }
    }

    private String formatProviderError(int statusCode, String responseBody) {
        if (statusCode == 401 || statusCode == 403) {
            return "Gemini rejected the API key. Check GEMINI_API_KEY and restart the backend.";
        }
        if (statusCode == 404) {
            return "The configured Gemini model was not found. Check GEMINI_MODEL (expected: gemini-3.6-flash).";
        }
        if (statusCode == 429) {
            return "Gemini rate limit reached. Please wait and try again.";
        }
        return "Gemini is temporarily unavailable. Please try again later.";
    }
}
