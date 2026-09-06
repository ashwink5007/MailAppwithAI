package com.mailapp.controller;

import com.mailapp.dto.AiCommandRequest;
import com.mailapp.dto.AiCommandResponse;
import com.mailapp.dto.ApiResponse;
import com.mailapp.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/command")
    public ResponseEntity<ApiResponse<AiCommandResponse>> interpret(
            @Valid @RequestBody AiCommandRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "AI command interpreted successfully",
                aiService.interpret(request)));
    }
}