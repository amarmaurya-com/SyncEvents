package org.codes.backend.controller;

import jakarta.validation.Valid;
import org.codes.backend.dto.CreateTeamRequest;
import org.codes.backend.dto.TeamResponse;
import org.codes.backend.dto.UserResponse;
import org.codes.backend.service.TeamService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@PreAuthorize("hasRole('PARTICIPANT')")
public class TeamController {
    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping("/me")
    public Map<String, List<TeamResponse>> getMyTeams(Authentication authentication) {
        return Map.of("teams", teamService.getMyTeams(authentication.getName()));
    }

    @GetMapping("/participants/search")
    public Map<String, List<UserResponse>> searchParticipants(
            @RequestParam String studentId,
            @RequestParam Integer eventId
    ) {
        return Map.of("participants", teamService.searchParticipants(studentId, eventId));
    }

    @PostMapping
    public TeamResponse createTeam(
            Authentication authentication,
            @Valid @RequestBody CreateTeamRequest request
    ) {
        return teamService.createTeam(authentication.getName(), request);
    }

    @DeleteMapping("/{teamId}/withdraw")
    public TeamResponse withdrawTeam(
            Authentication authentication,
            @PathVariable Integer teamId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body == null ? "" : body.get("reason");
        return teamService.withdrawTeam(authentication.getName(), teamId, reason);
    }
}
