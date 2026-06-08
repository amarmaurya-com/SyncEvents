package org.codes.backend.service;

import org.codes.backend.dto.CreateTeamRequest;
import org.codes.backend.dto.TeamResponse;
import org.codes.backend.dto.UserResponse;
import org.codes.backend.model.*;
import org.codes.backend.repository.EventRepo;
import org.codes.backend.repository.EventTeamRepo;
import org.codes.backend.repository.ParticipantRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@Service
@Transactional
public class TeamService {
    private final EventTeamRepo eventTeamRepo;
    private final EventRepo eventRepo;
    private final ParticipantRepo participantRepo;
    private final EventService eventService;
    private final AuthService authService;

    public TeamService(
            EventTeamRepo eventTeamRepo,
            EventRepo eventRepo,
            ParticipantRepo participantRepo,
            EventService eventService,
            AuthService authService
    ) {
        this.eventTeamRepo = eventTeamRepo;
        this.eventRepo = eventRepo;
        this.participantRepo = participantRepo;
        this.eventService = eventService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getMyTeams(String email) {
        Participant participant = findParticipantByEmail(email);

        return eventTeamRepo.findByParticipant(participant.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchParticipants(String studentId, Integer eventId) {
        if (studentId == null || studentId.isBlank()) {
            return List.of();
        }

        Event event = findEvent(eventId);
        if (event.getParticipationType() != ParticipationType.TEAM) {
            return List.of();
        }

        return participantRepo.findByParticipantIdContainingIgnoreCase(studentId.trim())    //Ignore uppercase/lowercase
                .stream()
                .filter(participant -> !eventTeamRepo.existsActiveTeamForParticipant(
                        event.getId(),
                        participant.getId(),
                        TeamStatus.CANCELLED
                ))
                .map(authService::toUserResponse)
                .toList();
    }

    public TeamResponse createTeam(String email, CreateTeamRequest request) {
        Participant leader = findParticipantByEmail(email);
        Event event = findEvent(request.eventId());

        validateEventIsOpenForRegistration(event);

        if (event.getParticipationType() != ParticipationType.TEAM) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Teams can only be created for team events."
            );
        }

        String teamName = requireText(request.teamName(), "Team name is required.");
        List<Integer> memberIds = request.members() == null ? List.of() : request.members();

        List<Participant> members = memberIds.stream()
                .distinct()
                .map(this::findParticipantById)
                .toList();

        boolean leaderAlreadyIncluded = members.stream()
                .anyMatch(member -> member.getId().equals(leader.getId()));

        int totalSize = members.size() + (leaderAlreadyIncluded ? 0 : 1);
        TeamConfig config = event.getTeamConfig();

        if (config == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Team configuration is missing for this event."
            );
        }

        if (totalSize < config.getMinSize() || totalSize > config.getMaxSize()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Team size must be between " + config.getMinSize() + " and " + config.getMaxSize() + "."
            );
        }

        if (!config.isAllowCrossInstitution()) {
            boolean invalidInstitution = members.stream()
                    .anyMatch(member -> !member.getInstitution().equalsIgnoreCase(leader.getInstitution()));

            if (invalidInstitution) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cross-institution teams are not allowed."
                );
            }
        }

        if (eventTeamRepo.existsActiveTeamForParticipant(event.getId(), leader.getId(), TeamStatus.CANCELLED)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already have a team for this event."
            );
        }

        for (Participant member : members) {
            if (eventTeamRepo.existsActiveTeamForParticipant(event.getId(), member.getId(), TeamStatus.CANCELLED)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        member.getName() + " is already in a team for this event."
                );
            }
        }

        EventTeam team = new EventTeam();
        team.setEvent(event);
        team.setLeader(leader);
        team.setTeamName(teamName);
        team.setStatus(TeamStatus.REGISTERED);

        List<TeamMember> teamMembers = members.stream()
                .filter(member -> !member.getId().equals(leader.getId()))
                .map(member -> {
                    TeamMember teamMember = new TeamMember();
                    teamMember.setTeam(team);
                    teamMember.setParticipant(member);
                    return teamMember;
                })
                .toList();

        team.getMembers().addAll(teamMembers);

        return toResponse(eventTeamRepo.save(team));
    }

    public TeamResponse withdrawTeam(String email, Integer teamId, String reason) {
        Participant participant = findParticipantByEmail(email);

        EventTeam team = eventTeamRepo.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found."));

        if (!team.getLeader().getId().equals(participant.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only team leader can withdraw the team."
            );
        }

        team.setStatus(TeamStatus.CANCELLED);
        team.setWithdrawReason(reason == null ? "" : reason.trim());

        return toResponse(team);
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

    private TeamResponse toResponse(EventTeam team) {
        List<UserResponse> members = Stream.concat(
                        Stream.of(team.getLeader()),
                        team.getMembers().stream().map(TeamMember::getParticipant)
                )
                .map(authService::toUserResponse)
                .toList();

        return new TeamResponse(
                team.getId(),
                eventService.toEventResponse(team.getEvent()),
                team.getTeamName(),
                authService.toUserResponse(team.getLeader()),
                members,
                team.getStatus().name().toLowerCase(Locale.ROOT),
                team.getCreatedAt()
        );
    }

    private Participant findParticipantByEmail(String email) {
        return participantRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participant not found."
                ));
    }

    private Participant findParticipantById(Integer id) {
        return participantRepo.findById(id)
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

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }

        return value.trim();
    }
}
