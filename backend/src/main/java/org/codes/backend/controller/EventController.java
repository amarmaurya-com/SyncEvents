package org.codes.backend.controller;

import jakarta.validation.Valid;
import org.codes.backend.dto.*;
import org.codes.backend.model.BaseUser;
import org.codes.backend.model.Roles;
import org.codes.backend.service.AuthService;
import org.codes.backend.service.EventService;
import org.codes.backend.service.WinnerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final AuthService authService;
    private final WinnerService winnerService;

    public EventController(EventService eventService, AuthService authService, WinnerService winnerService) {
        this.eventService = eventService;
        this.authService = authService;
        this.winnerService = winnerService;
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getEvents(Authentication authentication) {
        BaseUser user = getAuthenticatedUser(authentication);

        List<EventResponse> events = (user.getRole() == Roles.COORDINATOR)
                ? eventService.getEventsForCoordinator(user.getId())
                : eventService.getAllEvents();

        return ResponseEntity.ok(events);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request));
    }

    @PutMapping("/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Integer eventId,
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(eventId, request));
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.accepted().build();
    }

    @PatchMapping("/{eventId}/configuration")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public ResponseEntity<EventResponse> updateConfiguration(
            @PathVariable Integer eventId,
            @Valid @RequestBody EventConfigRequest request) {
        return ResponseEntity.ok(eventService.updateConfiguration(eventId, request));
    }

    @PatchMapping("/{eventId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public ResponseEntity<EventResponse> updateStatus(
            @PathVariable Integer eventId,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }
        return ResponseEntity.ok(eventService.updateStatus(eventId, status));
    }

    @PostMapping("/{eventId}/coordinators")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> assignCoordinator(
            @PathVariable Integer eventId,
            @RequestBody Map<String, Integer> body) {

        Integer coordinatorId = body.get("coordinatorId");
        if (coordinatorId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordinator ID is required");
        }
        return ResponseEntity.ok(eventService.assignCoordinator(eventId, coordinatorId));
    }

    @DeleteMapping("/{eventId}/coordinators/{coordinatorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> removeCoordinator(
            @PathVariable Integer eventId,
            @PathVariable Integer coordinatorId) {
        return ResponseEntity.ok(eventService.removeCoordinator(eventId, coordinatorId));
    }

    @GetMapping("/{eventId}/registrations")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public Map<String, List<RegistrationResponse>> getEventRegistrations(@PathVariable Integer eventId) {
        return Map.of("registrations", eventService.getEventRegistrations(eventId));
    }

    @GetMapping("/{eventId}/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public Map<String, List<TeamResponse>> getEventTeams(@PathVariable Integer eventId) {
        return Map.of("teams", eventService.getEventTeams(eventId));
    }

    @PatchMapping("/{eventId}/registrations/{registrationId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public RegistrationResponse updateRegistrationStatus(
            @PathVariable Integer eventId,
            @PathVariable Integer registrationId,
            @RequestBody StatusUpdateRequest request
    ) {
        return eventService.updateRegistrationStatus(eventId, registrationId, request.status());
    }

    @PatchMapping("/{eventId}/teams/{teamId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public TeamResponse updateTeamStatus(
            @PathVariable Integer eventId,
            @PathVariable Integer teamId,
            @RequestBody StatusUpdateRequest request
    ) {
        return eventService.updateTeamStatus(eventId, teamId, request.status());
    }

    @DeleteMapping("/{eventId}/registrations/{registrationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public RegistrationResponse removeRegistration(
            @PathVariable Integer eventId,
            @PathVariable Integer registrationId
    ) {
        return eventService.removeRegistration(eventId, registrationId);
    }

    @DeleteMapping("/{eventId}/teams/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public TeamResponse removeTeam(
            @PathVariable Integer eventId,
            @PathVariable Integer teamId
    ) {
        return eventService.removeTeam(eventId, teamId);
    }

    private BaseUser getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return authService.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping("/{eventId}/winners")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public WinnersResponse getEventWinners(@PathVariable Integer eventId) {
        return winnerService.getEventWinners(eventId);
    }

    @PostMapping("/{eventId}/winners")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public WinnersResponse assignWinner(
            @PathVariable Integer eventId,
            @RequestBody WinnerRequest request
    ) {
        return winnerService.assignWinner(eventId, request);
    }

    @DeleteMapping("/{eventId}/winners")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public WinnersResponse clearWinner(
            @PathVariable Integer eventId,
            @RequestBody WinnerRequest request
    ) {
        return winnerService.clearWinner(eventId, request);
    }
}
