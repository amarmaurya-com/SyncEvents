package org.codes.backend.service;

import org.codes.backend.dto.ParticipantWinnerResponse;
import org.codes.backend.dto.TeamWinnerResponse;
import org.codes.backend.dto.UserResponse;
import org.codes.backend.dto.WinnerRequest;
import org.codes.backend.dto.WinnersResponse;
import org.codes.backend.model.Event;
import org.codes.backend.model.EventTeam;
import org.codes.backend.model.EventWinner;
import org.codes.backend.model.Participant;
import org.codes.backend.model.ParticipationType;
import org.codes.backend.model.Registration;
import org.codes.backend.model.RegistrationStatus;
import org.codes.backend.model.TeamMember;
import org.codes.backend.model.TeamStatus;
import org.codes.backend.repository.EventRepo;
import org.codes.backend.repository.EventTeamRepo;
import org.codes.backend.repository.EventWinnerRepo;
import org.codes.backend.repository.ParticipantRepo;
import org.codes.backend.repository.RegistrationRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class WinnerService {
    private final EventWinnerRepo eventWinnerRepo;
    private final EventRepo eventRepo;
    private final RegistrationRepo registrationRepo;
    private final ParticipantRepo participantRepo;
    private final EventTeamRepo eventTeamRepo;
    private final AuthService authService;

    public WinnerService(
            EventWinnerRepo eventWinnerRepo,
            EventRepo eventRepo,
            RegistrationRepo registrationRepo,
            ParticipantRepo participantRepo,
            EventTeamRepo eventTeamRepo,
            AuthService authService
    ) {
        this.eventWinnerRepo = eventWinnerRepo;
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
        this.participantRepo = participantRepo;
        this.eventTeamRepo = eventTeamRepo;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public WinnersResponse getEventWinners(Integer eventId) {
        findEvent(eventId);

        List<ParticipantWinnerResponse> participantWinners = new ArrayList<>();
        List<TeamWinnerResponse> teamWinners = new ArrayList<>();

        eventWinnerRepo.findByEvent_IdOrderByRankAsc(eventId).forEach(winner -> {
            if (winner.getParticipant() != null) {
                participantWinners.add(toParticipantWinnerResponse(winner));
            }

            if (winner.getTeam() != null) {
                teamWinners.add(toTeamWinnerResponse(winner));
            }
        });

        return new WinnersResponse(participantWinners, teamWinners);
    }

    public WinnersResponse assignWinner(Integer eventId, WinnerRequest request) {
        Event event = findEvent(eventId);
        Integer rank = validateRank(request.rank());

        boolean hasParticipant = request.participantId() != null;
        boolean hasTeam = request.teamId() != null;

        if (hasParticipant == hasTeam) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide exactly one of participantId or teamId."
            );
        }

        if (event.getParticipationType() == ParticipationType.TEAM) {
            if (!hasTeam) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Team winner is required for team events."
                );
            }

            assignTeamWinner(event, request.teamId(), rank);
            return getEventWinners(eventId);
        }

        if (!hasParticipant) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Participant winner is required for individual events."
            );
        }

        assignParticipantWinner(event, request.participantId(), rank);
        return getEventWinners(eventId);
    }

    public WinnersResponse clearWinner(Integer eventId, WinnerRequest request) {
        findEvent(eventId);

        boolean hasParticipant = request.participantId() != null;
        boolean hasTeam = request.teamId() != null;

        if (hasParticipant == hasTeam) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide exactly one of participantId or teamId."
            );
        }

        if (hasParticipant) {
            eventWinnerRepo.findByEvent_IdAndParticipant_Id(eventId, request.participantId())
                    .ifPresent(eventWinnerRepo::delete);
        } else {
            eventWinnerRepo.findByEvent_IdAndTeam_Id(eventId, request.teamId())
                    .ifPresent(eventWinnerRepo::delete);
        }

        return getEventWinners(eventId);
    }

    private void assignParticipantWinner(Event event, Integer participantId, Integer rank) {
        if (event.getParticipationType() == ParticipationType.TEAM) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Participant winners are only allowed for individual events."
            );
        }

        Participant participant = participantRepo.findById(participantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participant not found."
                ));

        Registration registration = registrationRepo.findByEvent_IdAndParticipant_Id(
                        event.getId(),
                        participant.getId()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Participant is not registered for this event."
                ));

        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only participated participants can be marked as winners."
            );
        }

        EventWinner winner = eventWinnerRepo
                .findByEvent_IdAndParticipant_Id(event.getId(), participant.getId())
                .orElseGet(EventWinner::new);

        replaceExistingWinner(event, rank, winner);

        winner.setEvent(event);
        winner.setParticipant(participant);
        winner.setTeam(null);
        winner.setRank(rank);

        eventWinnerRepo.save(winner);
    }

    private void assignTeamWinner(Event event, Integer teamId, Integer rank) {
        if (event.getParticipationType() != ParticipationType.TEAM) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Team winners are only allowed for team events."
            );
        }

        EventTeam team = eventTeamRepo.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team not found."
                ));

        if (!team.getEvent().getId().equals(event.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Team is not registered for this event."
            );
        }

        if (team.getStatus() != TeamStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only participated teams can be marked as winners."
            );
        }

        EventWinner winner = eventWinnerRepo
                .findByEvent_IdAndTeam_Id(event.getId(), team.getId())
                .orElseGet(EventWinner::new);

        replaceExistingWinner(event, rank, winner);

        winner.setEvent(event);
        winner.setParticipant(null);
        winner.setTeam(team);
        winner.setRank(rank);

        eventWinnerRepo.save(winner);
    }

    private void replaceExistingWinner(Event event, Integer rank, EventWinner winnerToKeep) {
        eventWinnerRepo.findByEvent_IdAndRank(event.getId(), rank)
                .filter(existingWinner -> !existingWinner.getId().equals(winnerToKeep.getId()))
                .ifPresent(eventWinnerRepo::delete);
    }

    private Integer validateRank(Integer rank) {
        if (rank == null || rank < 1 || rank > 3) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rank must be between 1 and 3."
            );
        }

        return rank;
    }

    private Event findEvent(Integer eventId) {
        return eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found."
                ));
    }

    private ParticipantWinnerResponse toParticipantWinnerResponse(EventWinner winner) {
        return new ParticipantWinnerResponse(
                winner.getParticipant().getId(),
                authService.toUserResponse(winner.getParticipant()),
                winner.getRank(),
                winner.getCreatedAt()
        );
    }

    private TeamWinnerResponse toTeamWinnerResponse(EventWinner winner) {
        EventTeam team = winner.getTeam();

        List<UserResponse> members = new ArrayList<>();
        members.add(authService.toUserResponse(team.getLeader()));
        members.addAll(
                team.getMembers()
                        .stream()
                        .map(TeamMember::getParticipant)
                        .map(authService::toUserResponse)
                        .toList()
        );

        return new TeamWinnerResponse(
                team.getId(),
                team.getTeamName(),
                authService.toUserResponse(team.getLeader()),
                members,
                winner.getRank(),
                winner.getCreatedAt()
        );
    }
}
