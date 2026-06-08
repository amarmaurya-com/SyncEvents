package org.codes.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record StatusUpdateRequest(
        @NotBlank(message = "Status is required")
        String status
) {
}
