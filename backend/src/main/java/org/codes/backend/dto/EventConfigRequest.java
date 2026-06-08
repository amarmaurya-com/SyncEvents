package org.codes.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.codes.backend.model.TeamConfig;

import java.time.LocalDateTime;
import java.util.List;

public record EventConfigRequest(

        String eventType,

        String participationType,

        LocalDateTime registrationStartDate,

        LocalDateTime registrationEndDate,

        LocalDateTime eventDate,

        @NotBlank(message = "Venue is required")
        String venue,

        @Min(value = 1,
                message = "Maximum participants must be greater than 0")
        Integer maxParticipants,

        @NotBlank(message = "Rules are required")
        String rules,

        @NotEmpty(message = "At least one prize is required")
        List<
                @NotBlank(message = "Prize cannot be blank")
                        String
                > prizes,

        TeamConfig teamConfig
) {}