package org.codes.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.codes.backend.model.TeamConfig;

import java.time.LocalDateTime;
import java.util.List;

public record EventResponse(
        int id,
        String name,
        String description,
        String eventType,
        String participationType,
        LocalDateTime registrationStartDate,
        LocalDateTime registrationEndDate,
        LocalDateTime eventDate,
        String venue,
        int maxParticipants,
        String rules,
        List<String> prizes,
        String status,
        TeamConfig teamConfig,
        List<UserResponse> coordinators

) {

    @JsonProperty("_id")
    public int getId(){
        return id;
    }
}
