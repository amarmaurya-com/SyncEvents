package org.codes.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUserRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 3, max = 100)
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100)
        String password,

        @NotBlank(message = "Role is required")
        String role,

        @NotBlank(message = "Gender is required")
        String gender,

        @NotBlank(message = "Institution is required")
        String institution,

        @NotBlank(message = "Contact number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
        String contactNumber,

        String coordinatorId,
        String adminId
) {
}