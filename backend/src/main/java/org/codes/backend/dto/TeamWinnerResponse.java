package org.codes.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

public record TeamWinnerResponse(
        Integer id,
        String teamName,
        UserResponse leaderId,
        List<UserResponse> members,
        Integer rank,
        LocalDateTime createdAt
) {
    @JsonProperty("_id")
    public Integer getIdForClient() {
        return id;
    }
}
