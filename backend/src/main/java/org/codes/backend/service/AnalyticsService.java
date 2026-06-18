package org.codes.backend.service;

import org.codes.backend.dto.CertificateResponse;
import org.codes.backend.dto.EventResponse;
import org.codes.backend.dto.UserResponse;
import org.codes.backend.model.*;
import org.codes.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {
    private final EventRepo eventRepo;
    private final RegistrationRepo registrationRepo;
    private final EventTeamRepo eventTeamRepo;
    private final ParticipantRepo participantRepo;
    private final CoordinatorRepo coordinatorRepo;
    private final CertificateRepo certificateRepo;
    private final EventWinnerRepo eventWinnerRepo;
    private final AuthService authService;
    private final EventService eventService;
    private final CertificateService certificateService;

    public AnalyticsService(
            EventRepo eventRepo,
            RegistrationRepo registrationRepo,
            EventTeamRepo eventTeamRepo,
            ParticipantRepo participantRepo,
            CoordinatorRepo coordinatorRepo,
            CertificateRepo certificateRepo,
            EventWinnerRepo eventWinnerRepo,
            AuthService authService,
            EventService eventService,
            CertificateService certificateService
    ) {
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
        this.eventTeamRepo = eventTeamRepo;
        this.participantRepo = participantRepo;
        this.coordinatorRepo = coordinatorRepo;
        this.certificateRepo = certificateRepo;
        this.eventWinnerRepo = eventWinnerRepo;
        this.authService = authService;
        this.eventService = eventService;
        this.certificateService = certificateService;
    }

    public Map<String, Object> getOverview() {
        List<Event> events = eventRepo.findAll();
        List<Registration> registrations = registrationRepo.findAll();
        List<EventTeam> teams = eventTeamRepo.findAll();
        List<Participant> participants = participantRepo.findAll();
        List<Coordinator> coordinators = coordinatorRepo.findAll();

        return Map.of(
                        "totalEvents", events.size(),
                        "totalParticipants", participants.size(),
                        "totalRegistrations", registrations.size(),
                        "totalTeams", teams.size(),
                        "coordinatorCount", coordinators.size(),
                        "eventsByStatus", countByEnum(events.stream().map(Event::getStatus)),
                        "eventsByType", countByEnum(events.stream().map(Event::getEventType)),
                        "genderDistribution", countByEnum(participants.stream().map(Participant::getGender)),
                "coordinatorWorkload", coordinators.stream()
                        .map(coordinator -> coordinatorWorkload(coordinator, events))
                        .toList()
        );
    }

    public List<Map<String, Object>> getEventReport() {
        return eventRepo.findAll()
                .stream()
                .map(this::eventReport)
                .toList();
    }

    public Map<String, Object> getCoordinatorSummary(String email) {
        Coordinator coordinator = coordinatorRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coordinator not found."));

        List<Event> events = eventRepo.findByCoordinators_Id(coordinator.getId());
        long totalParticipants = events.stream()
                .mapToLong(event -> totalPeopleForEvent(event.getId()))
                .sum();
        long participated = events.stream()
                .mapToLong(event -> participatedPeopleForEvent(event.getId()))
                .sum();
        long certificatesIssued = events.stream()
                .mapToLong(event -> certificateRepo.countByEvent_Id(event.getId()))
                .sum();

        return Map.of(
                "summary", Map.of(
                        "assignedEvents", events.size(),
                        "byStatus", countByEnum(events.stream().map(Event::getStatus)),
                        "totalParticipants", totalParticipants,
                        "participationRate", percent(participated, totalParticipants),
                        "certificatesIssued", certificatesIssued
                ),
                "pendingTasks", Map.of(
                        "certificateGenerationPending", events.stream()
                                .filter(event -> certificatePending(event.getId()))
                                .count(),
                        "winnerDeclarationsPending", events.stream()
                                .filter(event -> eventWinnerRepo.findByEvent_IdOrderByRankAsc(event.getId()).isEmpty())
                                .count(),
                        "incompleteEvents", events.stream()
                                .filter(event -> event.getStatus() != EventStatus.COMPLETED)
                                .count()
                )
        );
    }

    public Map<String, Object> getCoordinatorWorkspace(Integer eventId) {
        Event event = findEvent(eventId);

        return Map.of(
                "event", eventService.toEventResponse(event),
                "tasks", List.of(
                        task("Configuration", event.getVenue() != null && event.getMaxParticipants() > 0),
                        task("Attendance", participatedPeopleForEvent(eventId) > 0),
                        task("Winners", !eventWinnerRepo.findByEvent_IdOrderByRankAsc(eventId).isEmpty()),
                        task("Certificates", certificateRepo.countByEvent_Id(eventId) > 0)
                )
        );
    }

    public Map<String, Object> getEventAnalytics(Integer eventId) {
        Event event = findEvent(eventId);

        return Map.of(
                "_id", event.getId(),
                "name", event.getName(),
                "eventType", enumText(event.getEventType()),
                "participationType", enumText(event.getParticipationType()),
                "status", enumText(event.getStatus()),
                "totalParticipants", totalPeopleForEvent(eventId),
                "registrationsCount", registrationRepo.findByEvent_Id(eventId).size(),
                "teamsCount", eventTeamRepo.findByEvent_Id(eventId).size(),
                "certificatesGenerated", certificateRepo.countByEvent_Id(eventId),
                "winnersDeclared", eventWinnerRepo.findByEvent_IdOrderByRankAsc(eventId).size()
        );
    }

    public Map<String, Object> getEventAttendance(Integer eventId) {
        findEvent(eventId);

        long registered = totalPeopleForEvent(eventId);
        long participated = participatedPeopleForEvent(eventId);
        long absent = absentPeopleForEvent(eventId);

        return Map.of(
                "attendance", Map.of(
                        "totalRegisteredPeople", registered,
                        "totalParticipatedPeople", participated,
                        "totalAbsentPeople", absent,
                        "participationRate", percent(participated, registered)
                ),
                "registrationTimeline", registrationTimeline(eventId)
        );
    }

    public Map<String, Object> getEventCertificates(Integer eventId) {
        findEvent(eventId);

        long participationEligible = participationCertificateEligiblePeople(eventId);
        long achievementEligible = achievementCertificateEligiblePeople(eventId);
        long participationGenerated = certificateRepo.countByEvent_IdAndCertificateType(eventId, CertificateType.PARTICIPATION);
        long achievementGenerated = certificateRepo.countByEvent_IdAndCertificateType(eventId, CertificateType.ACHIEVEMENT);

        return Map.of(
                "summary", Map.of(
                        "eligible", Map.of(
                                "participation", participationEligible,
                                "achievement", achievementEligible
                        ),
                        "generated", Map.of(
                                "participation", participationGenerated,
                                "achievement", achievementGenerated
                        ),
                        "pending", Map.of(
                                "participation", Math.max(0, participationEligible - participationGenerated),
                                "achievement", Math.max(0, achievementEligible - achievementGenerated)
                        )
                ),
                "breakdown", List.of(
                        certificateBreakdown("Participation", participationEligible, participationGenerated),
                        certificateBreakdown("Achievement", achievementEligible, achievementGenerated)
                ),
                "recentCertificates", certificateRepo.findTop10ByEvent_IdOrderByGeneratedAtDesc(eventId)
                        .stream()
                        .map(certificateService::toResponse)
                        .toList()
        );
    }

    public Map<String, Object> getEventBreakdowns(Integer eventId) {
        List<Participant> participants = participantsForEvent(eventId);

        return Map.of(
                "gender", Map.of("chart", countNamed(participants.stream().map(Participant::getGender))),
                "institutions", Map.of("chart", countNamed(participants.stream().map(Participant::getInstitution)))
        );
    }

    public List<Map<String, Object>> getAdminCoordinatorAnalytics() {
        List<Event> events = eventRepo.findAll();

        return coordinatorRepo.findAll()
                .stream()
                .map(coordinator -> {
                    List<Event> assigned = events.stream()
                            .filter(event -> event.getCoordinators().contains(coordinator))
                            .toList();

                    long participantsHandled = assigned.stream()
                            .mapToLong(event -> totalPeopleForEvent(event.getId()))
                            .sum();

                    long certificatesGenerated = assigned.stream()
                            .mapToLong(event -> certificateRepo.countByEvent_Id(event.getId()))
                            .sum();

                    long winnersDeclared = assigned.stream()
                            .mapToLong(event -> eventWinnerRepo.findByEvent_IdOrderByRankAsc(event.getId()).size())
                            .sum();

                    return Map.of(
                            "coordinator", authService.toUserResponse(coordinator),
                            "assignedEvents", assigned.size(),
                            "participantsHandled", participantsHandled,
                            "certificatesGenerated", certificatesGenerated,
                            "activeEvents", assigned.stream()
                                    .filter(event -> event.getStatus() == EventStatus.PUBLISHED)
                                    .count(),
                            "winnersDeclared", winnersDeclared
                    );
                })
                .toList();
    }

    private Map<String, Object> eventReport(Event event) {
        return Map.of(
                "_id", event.getId(),
                "name", event.getName(),
                "eventType", enumText(event.getEventType()),
                "status", enumText(event.getStatus()),
                "totalParticipants", totalPeopleForEvent(event.getId()),
                "registrationsCount", registrationRepo.findByEvent_Id(event.getId()).size(),
                "teamsCount", eventTeamRepo.findByEvent_Id(event.getId()).size(),
                "certificatesGenerated", certificateRepo.countByEvent_Id(event.getId()),
                "winnersDeclared", eventWinnerRepo.findByEvent_IdOrderByRankAsc(event.getId()).size()
        );
    }

    private Map<String, Object> coordinatorWorkload(Coordinator coordinator, List<Event> events) {
        List<EventResponse> assignedEvents = events.stream()
                .filter(event -> event.getCoordinators().contains(coordinator))
                .map(eventService::toEventResponse)
                .toList();

        long totalParticipants = assignedEvents.stream()
                .mapToLong(event -> totalPeopleForEvent(event.id()))
                .sum();

        return Map.of(
                "coordinator", authService.toUserResponse(coordinator),
                "events", assignedEvents,
                "totalParticipants", totalParticipants
        );
    }

    private Map<String, Object> task(String label, boolean complete) {
        return Map.of(
                "label", label,
                "complete", complete
        );
    }

    private Map<String, Object> certificateBreakdown(String name, long eligible, long generated) {
        return Map.of(
                "name", name,
                "eligible", eligible,
                "generated", generated,
                "pending", Math.max(0, eligible - generated)
        );
    }

    private List<Map<String, Object>> registrationTimeline(Integer eventId) {
        return registrationRepo.findByEvent_Id(eventId)
                .stream()
                .collect(Collectors.groupingBy(
                        registration -> registration.getRegisteredAt().toLocalDate(),
                        TreeMap::new,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .map(entry -> Map.<String, Object>of(
                        "date", entry.getKey(),
                        "count", entry.getValue()
                ))
                .toList();
    }

    private long totalPeopleForEvent(Integer eventId) {
        return registrationRepo.findByEvent_Id(eventId).size()
                + eventTeamRepo.findByEvent_Id(eventId)
                .stream()
                .mapToLong(team -> 1L + team.getMembers().size())
                .sum();
    }

    private long participatedPeopleForEvent(Integer eventId) {
        return registrationRepo.findByEvent_IdAndStatus(eventId, RegistrationStatus.APPROVED).size()
                + eventTeamRepo.findByEvent_IdAndStatus(eventId, TeamStatus.APPROVED)
                .stream()
                .mapToLong(team -> 1L + team.getMembers().size())
                .sum();
    }

    private long absentPeopleForEvent(Integer eventId) {
        return registrationRepo.findByEvent_IdAndStatus(eventId, RegistrationStatus.REJECTED).size()
                + eventTeamRepo.findByEvent_IdAndStatus(eventId, TeamStatus.REJECTED)
                .stream()
                .mapToLong(team -> 1L + team.getMembers().size())
                .sum();
    }

    private boolean certificatePending(Integer eventId) {
        return participationCertificateEligiblePeople(eventId) + achievementCertificateEligiblePeople(eventId)
                > certificateRepo.countByEvent_Id(eventId);
    }

    private List<Participant> participantsForEvent(Integer eventId) {
        List<Participant> individualParticipants = registrationRepo.findByEvent_Id(eventId)
                .stream()
                .map(Registration::getParticipant)
                .toList();

        List<Participant> teamParticipants = eventTeamRepo.findByEvent_Id(eventId)
                .stream()
                .flatMap(team -> Stream.concat(
                        Stream.of(team.getLeader()),
                        team.getMembers().stream().map(TeamMember::getParticipant)
                ))
                .toList();

        return Stream.concat(individualParticipants.stream(), teamParticipants.stream())
                .distinct()
                .toList();
    }

    private long participationCertificateEligiblePeople(Integer eventId) {
        Set<Integer> winnerParticipantIds = winnerParticipantIds(eventId);

        return participatedParticipantsForEvent(eventId).stream()
                .filter(participant -> !winnerParticipantIds.contains(participant.getId()))
                .count();
    }

    private long achievementCertificateEligiblePeople(Integer eventId) {
        return winnerParticipantIds(eventId).size();
    }

    private List<Participant> participatedParticipantsForEvent(Integer eventId) {
        Map<Integer, Participant> participants = new LinkedHashMap<>();

        registrationRepo.findByEvent_IdAndStatus(eventId, RegistrationStatus.APPROVED)
                .forEach(registration -> participants.putIfAbsent(
                        registration.getParticipant().getId(),
                        registration.getParticipant()
                ));

        eventTeamRepo.findByEvent_IdAndStatus(eventId, TeamStatus.APPROVED)
                .forEach(team -> teamParticipants(team).forEach(participant -> participants.putIfAbsent(
                        participant.getId(),
                        participant
                )));

        return new ArrayList<>(participants.values());
    }

    private Set<Integer> winnerParticipantIds(Integer eventId) {
        Set<Integer> participantIds = new LinkedHashSet<>();

        eventWinnerRepo.findByEvent_IdOrderByRankAsc(eventId).forEach(winner -> {
            if (winner.getParticipant() != null) {
                participantIds.add(winner.getParticipant().getId());
            }

            if (winner.getTeam() != null) {
                teamParticipants(winner.getTeam()).forEach(participant -> participantIds.add(participant.getId()));
            }
        });

        return participantIds;
    }

    private List<Participant> teamParticipants(EventTeam team) {
        return Stream.concat(
                        Stream.of(team.getLeader()),
                        team.getMembers().stream().map(TeamMember::getParticipant)
                )
                .toList();
    }

    private Event findEvent(Integer eventId) {
        return eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
    }

    private int percent(long part, long total) {
        if (total == 0) {
            return 0;
        }

        return (int) Math.round((part * 100.0) / total);
    }

    private String enumText(Enum<?> value) {
        return value == null ? "unknown" : value.name().toLowerCase(Locale.ROOT);
    }

    private List<Map<String, Object>> countByEnum(Stream<? extends Enum<?>> stream) {
        return countNamed(stream.map(this::enumText));
    }

    private List<Map<String, Object>> countNamed(Stream<?> stream) {
        return stream
                .filter(Objects::nonNull)
                .map(String::valueOf)
                .collect(Collectors.groupingBy(value -> value, Collectors.counting()))
                .entrySet()
                .stream()
                .map(entry -> Map.<String, Object>of(
                        "_id", entry.getKey(),
                        "name", entry.getKey(),
                        "count", entry.getValue()
                ))
                .toList();
    }
}
