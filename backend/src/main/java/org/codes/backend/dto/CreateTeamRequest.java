package org.codes.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateTeamRequest(
        @NotNull(message = "Event ID is required")
        Integer eventId,

        @NotBlank(message = "Team name is required")
        String teamName,

        List<Integer> members
) {
}
