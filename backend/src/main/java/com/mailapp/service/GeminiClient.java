package com.mailapp.service;

public interface GeminiClient {
    String generateAction(String systemInstruction, String userPrompt);
}
