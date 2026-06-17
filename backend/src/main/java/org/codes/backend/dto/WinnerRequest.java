package org.codes.backend.dto;

public record WinnerRequest(
        Integer participantId,
        Integer teamId,
        Integer rank
) {
}
