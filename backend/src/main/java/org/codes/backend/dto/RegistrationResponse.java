package org.codes.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record RegistrationResponse(
        Integer id,
        EventResponse eventId,
        UserResponse participantId,
        String status,
        LocalDateTime registeredAt
) {
    @JsonProperty("_id")
    public Integer getIdForClient() {
        return id;
    }
}
