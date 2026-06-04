package org.codes.backend.controller;

import jakarta.validation.Valid;
import org.codes.backend.dto.EventConfigRequest;
import org.codes.backend.dto.EventRequest;
import org.codes.backend.dto.EventResponse;
import org.codes.backend.model.BaseUser;
import org.codes.backend.model.Roles;
import org.codes.backend.service.AuthService;
import org.codes.backend.service.EventService;
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

    public EventController(EventService eventService, AuthService authService) {
        this.eventService = eventService;
        this.authService = authService;
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
            @RequestBody EventConfigRequest request) {
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

    private BaseUser getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return authService.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}