package org.codes.backend.service;

import jakarta.validation.Valid;
import org.codes.backend.dto.*;
import org.codes.backend.model.*;
import org.codes.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Validated
@Transactional
public class EventService {
    private final EventRepo eventRepo;
    private final CoordinatorRepo coordinatorRepo;
    private final RegistrationRepo registrationRepo;
    private final EventTeamRepo eventTeamRepo;
    private final CertificateRepo certificateRepo;
    private final AuthService authService;
    private final EventWinnerRepo eventWinnerRepo;


    public EventService(
            EventRepo eventRepo,
            CoordinatorRepo coordinatorRepo,
            RegistrationRepo registrationRepo,
            EventTeamRepo eventTeamRepo,
            CertificateRepo certificateRepo,
            AuthService authService, EventWinnerRepo eventWinnerRepo
    ) {
        this.eventRepo = eventRepo;
        this.coordinatorRepo = coordinatorRepo;
        this.registrationRepo = registrationRepo;
        this.eventTeamRepo = eventTeamRepo;
        this.certificateRepo = certificateRepo;
        this.authService = authService;
        this.eventWinnerRepo = eventWinnerRepo;
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
        eventWinnerRepo.deleteByEvent_Id(eventId);
        certificateRepo.deleteByEvent_Id(eventId);
        registrationRepo.deleteByEvent_Id(eventId);
        eventTeamRepo.deleteAll(eventTeamRepo.findByEvent_Id(eventId));
        event.getCoordinators().clear();
        event.getPrizes().clear();
        eventRepo.delete(event);
    }

    public EventResponse updateConfiguration(Integer eventId, EventConfigRequest request) {
        Event event = findEventById(eventId);

        validateConfiguration(request);

        if (request.eventType() != null) {
            event.setEventType(parseEventType(request.eventType()));
        }

        if (request.participationType() != null) {
            event.setParticipationType(parseParticipationType(request.participationType()));
        }

        event.setRegistrationEndDate(request.registrationEndDate());
        event.setRegistrationStartDate(request.registrationStartDate());
        event.setEventDate(request.eventDate());
        event.setVenue(request.venue());
        event.setMaxParticipants(request.maxParticipants());
        event.setRules(request.rules());
        event.setPrizes(request.prizes() != null ? request.prizes() : new ArrayList<>());

        event.setTeamConfig(ParticipationType.TEAM.equals(event.getParticipationType()) && request.teamConfig() != null
                ? request.teamConfig()
                : null);

        return toEventResponse(event);
    }

    private void validateConfiguration(EventConfigRequest request) {
        if (
                request.registrationStartDate() != null
                        && request.registrationEndDate() != null
                        && request.registrationStartDate().isAfter(request.registrationEndDate())
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration start date must be before or same as registration end date."
            );
        }

        if (
                request.registrationEndDate() != null
                        && request.eventDate() != null
                        && request.registrationEndDate().isAfter(request.eventDate())
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration end date must be before or same as event date."
            );
        }

        if (request.maxParticipants() == null || request.maxParticipants() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum participants must be greater than 0."
            );
        }

        if (
                request.participationType() != null
                        && ParticipationType.TEAM.equals(
                        parseParticipationType(request.participationType())
                )
        ) {
            TeamConfig teamConfig = request.teamConfig();

            if (teamConfig == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Team configuration is required for team events."
                );
            }

            if (teamConfig.getMinSize() < 1) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Minimum team size must be greater than 0."
                );
            }

            if (teamConfig.getMaxSize() < teamConfig.getMinSize()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Maximum team size must be greater than or equal to minimum team size."
                );
            }
        }
    }

    public EventResponse updateStatus(Integer eventId, String status) {
        Event event = findEventById(eventId);
        if (status != null) {
            event.setStatus(parseEventStatus(status));
        }
        return toEventResponse(event);
    }

    private EventType parseEventType(String value) {
        try {
            return EventType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid event type.");
        }
    }

    private ParticipationType parseParticipationType(String value) {
        try {
            return ParticipationType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid participation type.");
        }
    }

    private EventStatus parseEventStatus(String value) {
        try {
            return EventStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid event status.");
        }
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

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getEventRegistrations(Integer eventId) {
        findEventById(eventId);

        return registrationRepo.findAll()
                .stream()
                .filter(registration -> registration.getEvent().getId().equals(eventId))
                .map(this::toRegistrationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getEventTeams(Integer eventId) {
        findEventById(eventId);

        return eventTeamRepo.findAll()
                .stream()
                .filter(team -> team.getEvent().getId().equals(eventId))
                .map(this::toTeamResponse)
                .toList();
    }

    public RegistrationResponse updateRegistrationStatus(
            Integer eventId,
            Integer registrationId,
            String status
    ) {
        Registration registration = findRegistrationForEvent(eventId, registrationId);
        registration.setStatus(parseRegistrationStatus(status));
        return toRegistrationResponse(registration);
    }

    public TeamResponse updateTeamStatus(
            Integer eventId,
            Integer teamId,
            String status
    ) {
        EventTeam team = findTeamForEvent(eventId, teamId);
        team.setStatus(parseTeamStatus(status));
        return toTeamResponse(team);
    }

    public RegistrationResponse removeRegistration(Integer eventId, Integer registrationId) {
        Registration registration = findRegistrationForEvent(eventId, registrationId);
        registration.setStatus(RegistrationStatus.CANCELLED);
        return toRegistrationResponse(registration);
    }

    public TeamResponse removeTeam(Integer eventId, Integer teamId) {
        EventTeam team = findTeamForEvent(eventId, teamId);
        team.setStatus(TeamStatus.CANCELLED);
        return toTeamResponse(team);
    }

    private Event findEventById(Integer eventId) {
        return eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    private Registration findRegistrationForEvent(Integer eventId, Integer registrationId) {
        Registration registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        if (!registration.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found for this event.");
        }

        return registration;
    }

    private EventTeam findTeamForEvent(Integer eventId, Integer teamId) {
        EventTeam team = eventTeamRepo.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (!team.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found for this event.");
        }

        return team;
    }

    private RegistrationStatus parseRegistrationStatus(String value) {
        try {
            return RegistrationStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid registration status.");
        }
    }

    private TeamStatus parseTeamStatus(String value) {
        try {
            return TeamStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid team status.");
        }
    }

    private RegistrationResponse toRegistrationResponse(Registration registration) {
        Integer rank = eventWinnerRepo
                .findByEvent_IdAndParticipant_Id(
                        registration.getEvent().getId(),
                        registration.getParticipant().getId()
                )
                .map(EventWinner::getRank)
                .orElse(null);
        return new RegistrationResponse(
                registration.getId(),
                toEventResponse(registration.getEvent()),
                authService.toUserResponse(registration.getParticipant()),
                registration.getStatus().name().toLowerCase(Locale.ROOT),
                registration.getRegisteredAt(),
                rank != null,
                rank
        );
    }

    private TeamResponse toTeamResponse(EventTeam team) {
        List<UserResponse> members = new ArrayList<>();
        members.add(authService.toUserResponse(team.getLeader()));
        members.addAll(
                team.getMembers()
                        .stream()
                        .map(TeamMember::getParticipant)
                        .map(authService::toUserResponse)
                        .toList()
        );

        Integer rank = eventWinnerRepo
                .findByEvent_IdAndTeam_Id(
                        team.getEvent().getId(),
                        team.getId()
                )
                .map(EventWinner::getRank)
                .orElse(null);

        return new TeamResponse(
                team.getId(),
                toEventResponse(team.getEvent()),
                team.getTeamName(),
                authService.toUserResponse(team.getLeader()),
                members,
                team.getStatus().name().toLowerCase(Locale.ROOT),
                team.getCreatedAt(),
                rank != null,
                rank
        );
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
