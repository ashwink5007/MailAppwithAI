package com.mailapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendEmailRequest(
        @NotBlank @Email String to,
        String cc,
        String bcc,
        String subject,
        @NotBlank String body) {
}
