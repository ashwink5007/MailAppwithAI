package com.mailapp.controller;

import com.mailapp.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check endpoint.
 * Used by the frontend to verify backend connectivity.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok("Backend is running", Map.of(
                "status", "UP",
                "service", "mailapp-backend",
                "sprint", "3.1"
        ));
    }
}
