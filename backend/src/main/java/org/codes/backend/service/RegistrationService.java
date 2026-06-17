package org.codes.backend.service;

import org.codes.backend.dto.RegistrationResponse;
import org.codes.backend.model.*;
import org.codes.backend.repository.EventRepo;
import org.codes.backend.repository.ParticipantRepo;
import org.codes.backend.repository.RegistrationRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class RegistrationService {
    private final RegistrationRepo registrationRepo;
    private final EventRepo eventRepo;
    private final ParticipantRepo participantRepo;
    private final EventService eventService;
    private final AuthService authService;

    public RegistrationService(
            RegistrationRepo registrationRepo,
            EventRepo eventRepo,
            ParticipantRepo participantRepo,
            EventService eventService,
            AuthService authService
    ) {
        this.registrationRepo = registrationRepo;
        this.eventRepo = eventRepo;
        this.participantRepo = participantRepo;
        this.eventService = eventService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getMyRegistrations(String email) {
        Participant participant = findParticipantByEmail(email);

        return registrationRepo.findByParticipant_Id(participant.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public RegistrationResponse register(String email, Integer eventId) {
        if (eventId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event ID is required.");
        }

        Participant participant = findParticipantByEmail(email);
        Event event = findEvent(eventId);

        validateEventIsOpenForRegistration(event);

        if (event.getParticipationType() != ParticipationType.INDIVIDUAL) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Use team registration for team events."
            );
        }

        Registration registration = registrationRepo
                .findByEvent_IdAndParticipant_Id(eventId, participant.getId())
                .orElse(null);

        if (registration != null && registration.getStatus() != RegistrationStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Already registered for this event."
            );
        }

        long activeRegistrations = registrationRepo.countByEvent_IdAndStatusNot(
                eventId,
                RegistrationStatus.CANCELLED
        );

        if (event.getMaxParticipants() > 0 && activeRegistrations >= event.getMaxParticipants()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is full.");
        }

        if (registration == null) {
            registration = new Registration();
            registration.setEvent(event);
            registration.setParticipant(participant);
        }

        registration.setStatus(RegistrationStatus.REGISTERED);
        registration.setWithdrawReason(null);

        return toResponse(registrationRepo.save(registration));
    }

    public RegistrationResponse withdraw(String email, Integer registrationId, String reason) {
        Participant participant = findParticipantByEmail(email);

        Registration registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registration not found."
                ));

        if (!registration.getParticipant().getId().equals(participant.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot withdraw this registration."
            );
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setWithdrawReason(reason == null ? "" : reason.trim());

        return toResponse(registration);
    }

    private void validateEventIsOpenForRegistration(Event event) {
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration is not open for this event."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (event.getRegistrationStartDate() != null && now.isBefore(event.getRegistrationStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration has not started.");
        }

        if (event.getRegistrationEndDate() != null && now.isAfter(event.getRegistrationEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration is closed.");
        }
    }

    private Participant findParticipantByEmail(String email) {
        return participantRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participant not found."
                ));
    }

    private Event findEvent(Integer eventId) {
        return eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found."
                ));
    }

    private RegistrationResponse toResponse(Registration registration) {
        return new RegistrationResponse(
                registration.getId(),
                eventService.toEventResponse(registration.getEvent()),
                authService.toUserResponse(registration.getParticipant()),
                registration.getStatus().name().toLowerCase(Locale.ROOT),
                registration.getRegisteredAt(),
                false,
                null
        );
    }
}
