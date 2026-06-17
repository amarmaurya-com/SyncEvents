package org.codes.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record ParticipantWinnerResponse(
        Integer id,
        UserResponse participantId,
        Integer rank,
        LocalDateTime createdAt
) {
    @JsonProperty("_id")
    public Integer getIdForClient() {
        return id;
    }
}
