package org.codes.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

public record TeamResponse(
        Integer id,
        EventResponse eventId,
        String teamName,
        UserResponse leaderId,
        List<UserResponse> members,
        String status,
        LocalDateTime createdAt
) {
    @JsonProperty("_id")
    public Integer getIdForClient() {
        return id;
    }
}
