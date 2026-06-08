package org.codes.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserResponse(
        Integer id,
        String name,
        String email,
        String role,
        String gender,
        String institution,
        String contactNumber,
        String studentId,
        String coordinatorId,
        String adminId
) {
    @JsonProperty("_id")
    public Integer getIdForClient() {
        return id;
    }
}
