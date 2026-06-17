package org.codes.backend.dto;

import java.util.List;

public record WinnersResponse(
        List<ParticipantWinnerResponse> participantWinners,
        List<TeamWinnerResponse> teamWinners
) {
}
