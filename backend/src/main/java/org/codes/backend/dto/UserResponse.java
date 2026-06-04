package org.codes.backend.dto;

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
    public Integer getID(){
        return id;
    }
}
