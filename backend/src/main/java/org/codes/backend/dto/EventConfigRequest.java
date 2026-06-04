package org.codes.backend.dto;

import org.codes.backend.model.TeamConfig;

import java.time.LocalDateTime;
import java.util.List;

public record EventConfigRequest(
        String eventType,
        String participationType,
        LocalDateTime registrationStartDate,
        LocalDateTime registrationEndDate,
        LocalDateTime eventDate,
        String venue,
        int maxParticipants,
        String rules,
        List<String> prizes,
        TeamConfig teamConfig
) {
}
