package org.codes.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record EventRequest(

        @NotBlank(message = "Event name is request")
        String name,
        String description
) {
}
