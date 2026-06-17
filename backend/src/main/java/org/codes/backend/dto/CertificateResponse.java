package org.codes.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record CertificateResponse(
        Integer id,
        EventResponse eventId,
        UserResponse participantId,
        String certificateType,
        Integer rank,
        String certificateNumber,
        LocalDateTime generatedAt
) {
    @JsonProperty("_id")
    public Integer getIdForClient() {
        return id;
    }

    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAtForClient() {
        return generatedAt;
    }
}
