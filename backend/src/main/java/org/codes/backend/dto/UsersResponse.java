package org.codes.backend.dto;

import java.util.List;

public record UsersResponse(
        List<UserResponse> users
) {
}
