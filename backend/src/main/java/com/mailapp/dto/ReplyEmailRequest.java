package com.mailapp.dto;

import jakarta.validation.constraints.NotBlank;

public record ReplyEmailRequest(@NotBlank String body) {
}
