package org.codes.backend.service;

import jakarta.validation.Valid;
import org.codes.backend.dto.*;
import org.codes.backend.model.*;
import org.codes.backend.repository.CoordinatorRepo;
import org.codes.backend.repository.EventRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@Validated
@Transactional
public class EventService {
    private final EventRepo eventRepo;
    private final CoordinatorRepo coordinatorRepo;
    private final AuthService authService;

    public EventService(EventRepo eventRepo, CoordinatorRepo coordinatorRepo, AuthService authService) {
        this.eventRepo = eventRepo;
        this.coordinatorRepo = coordinatorRepo;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsForCoordinator(Integer id) {
        return eventRepo.findByCoordinators_Id(id).stream()
                .map(this::toEventResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepo.findAll().stream()
                .map(this::toEventResponse)
                .toList();
    }

    public EventResponse createEvent(@Valid EventRequest request) {
        Event event = Event.builder()
                .name(request.name().trim())
                .description(request.description() != null ? request.description().trim() : null)
                .status(EventStatus.DRAFT)
                .eventType(EventType.OTHER)
                .participationType(ParticipationType.INDIVIDUAL)
                .build();
        return toEventResponse(eventRepo.save(event));
    }

    public EventResponse updateEvent(Integer eventId, @Valid EventRequest request) {
        Event event = findEventById(eventId);
        event.setName(request.name().trim());
        event.setDescription(request.description() != null ? request.description().trim() : null);
        return toEventResponse(event);
    }

    public void deleteEvent(Integer eventId) {
        Event event = findEventById(eventId);
        eventRepo.delete(event);
    }

    public EventResponse updateConfiguration(Integer eventId, EventConfigRequest request) {
        Event event = findEventById(eventId);


        if (request.eventType() != null) {
            event.setEventType(EventType.valueOf(request.eventType().trim().toUpperCase()));
        }

        if (request.participationType() != null) {
            event.setParticipationType(ParticipationType.valueOf(request.participationType().trim().toUpperCase()));
        }

        event.setRegistrationEndDate(request.registrationEndDate());
        event.setRegistrationStartDate(request.registrationStartDate());
        event.setEventDate(request.eventDate());
        event.setVenue(request.venue());
        event.setMaxParticipants(request.maxParticipants());
        event.setRules(request.rules());
        event.setPrizes(request.prizes() != null ? request.prizes() : new ArrayList<>());

        // Bulletproof comparison using enum references
        event.setTeamConfig(ParticipationType.TEAM.equals(event.getParticipationType()) && request.teamConfig() != null
                ? request.teamConfig()
                : null);

        return toEventResponse(event);
    }

    public EventResponse updateStatus(Integer eventId, String status) {
        Event event = findEventById(eventId);
        if (status != null) {
            event.setStatus(EventStatus.valueOf(status.trim().toUpperCase()));
        }
        return toEventResponse(event);
    }

    public EventResponse assignCoordinator(Integer eventId, Integer coordinatorId) {
        Event event = findEventById(eventId);
        Coordinator coordinator = coordinatorRepo.findById(coordinatorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coordinator not found"));

        event.getCoordinators().add(coordinator);
        return toEventResponse(event);
    }

    public EventResponse removeCoordinator(Integer eventId, Integer coordinatorId) {
        Event event = findEventById(eventId);
        Coordinator coordinator = coordinatorRepo.findById(coordinatorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coordinator not found"));

        event.getCoordinators().remove(coordinator);
        return toEventResponse(event);
    }

    private Event findEventById(Integer eventId) {
        return eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    public EventResponse toEventResponse(Event event) {
        List<UserResponse> coordinatorResponses = event.getCoordinators().stream()
                .map(authService::toUserResponse)
                .toList();

        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getEventType() != null ? event.getEventType().name() : null,
                event.getParticipationType() != null ? event.getParticipationType().name() : null,
                event.getRegistrationStartDate(),
                event.getRegistrationEndDate(),
                event.getEventDate(),
                event.getVenue(),
                event.getMaxParticipants(),
                event.getRules(),
                event.getPrizes(),
                event.getStatus() != null ? event.getStatus().name() : null,               // Map back to string for DTO
                event.getTeamConfig(),
                coordinatorResponses
        );
    }
}
