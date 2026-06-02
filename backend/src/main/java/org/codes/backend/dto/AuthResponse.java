package org.codes.backend.dto;

public record AuthResponse(
        String message,
        UserResponse user
) {
}
