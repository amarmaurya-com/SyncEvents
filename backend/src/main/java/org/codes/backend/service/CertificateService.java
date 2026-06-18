package org.codes.backend.service;

import org.codes.backend.dto.CertificateBatchRequest;
import org.codes.backend.dto.CertificateBatchResponse;
import org.codes.backend.dto.CertificateResponse;
import org.codes.backend.model.*;
import org.codes.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CertificateService {
    private final CertificateRepo certificateRepo;
    private final ParticipantRepo participantRepo;
    private final EventRepo eventRepo;
    private final RegistrationRepo registrationRepo;
    private final EventTeamRepo eventTeamRepo;
    private final EventService eventService;
    private final AuthService authService;
    private final EventWinnerRepo eventWinnerRepo;
    private final CertificatePdfService certificatePdfService;

    public CertificateService(
            CertificateRepo certificateRepo,
            ParticipantRepo participantRepo,
            EventRepo eventRepo,
            RegistrationRepo registrationRepo,
            EventTeamRepo eventTeamRepo,
            EventService eventService,
            AuthService authService,
            EventWinnerRepo eventWinnerRepo,
            CertificatePdfService certificatePdfService
            ) {
        this.certificateRepo = certificateRepo;
        this.participantRepo = participantRepo;
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
        this.eventTeamRepo = eventTeamRepo;
        this.eventService = eventService;
        this.authService = authService;
        this.eventWinnerRepo = eventWinnerRepo;
        this.certificatePdfService = certificatePdfService;
    }

    public List<CertificateResponse> getMyCertificates(String email) {
        Participant participant = participantRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participant not found."
                ));

        return certificateRepo.findByParticipant_IdOrderByGeneratedAtDesc(participant.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CertificateBatchResponse generateBatch(Integer eventId, CertificateBatchRequest request) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        CertificateType certificateType = parseCertificateType(request.certificateType());
        List<CertificateResult> results = certificateType == CertificateType.ACHIEVEMENT
                ? generateAchievementCertificates(event)
                : generateParticipationCertificates(event);

        return new CertificateBatchResponse(
                results.stream().map(CertificateResult::certificate).map(this::toResponse).toList(),
                (int) results.stream().filter(CertificateResult::created).count(),
                (int) results.stream().filter(result -> !result.created()).count(),
                results.size()
        );
    }

    private List<CertificateResult> generateAchievementCertificates(Event event) {
        return winnerParticipants(event.getId()).values()
                .stream()
                .map(winnerParticipant -> findOrCreateCertificate(
                        event,
                        winnerParticipant.participant(),
                        CertificateType.ACHIEVEMENT,
                        winnerParticipant.rank()
                ))
                .toList();
    }

    private List<CertificateResult> generateParticipationCertificates(Event event) {
        Map<Integer, WinnerParticipant> winnerParticipants = winnerParticipants(event.getId());

        return participatedParticipants(event.getId()).stream()
                .filter(participant -> !winnerParticipants.containsKey(participant.getId()))
                .map(participant -> findOrCreateCertificate(
                        event,
                        participant,
                        CertificateType.PARTICIPATION,
                        null
                ))
                .toList();
    }

    private CertificateResult findOrCreateCertificate(
            Event event,
            Participant participant,
            CertificateType certificateType,
            Integer rank
    ) {
        return certificateRepo.findByEvent_IdAndParticipant_IdAndCertificateType(
                        event.getId(),
                        participant.getId(),
                        certificateType
                )
                .map(certificate -> new CertificateResult(certificate, false))
                .orElseGet(() -> new CertificateResult(
                        createCertificate(event, participant, certificateType, rank),
                        true
                ));
    }

    private Map<Integer, WinnerParticipant> winnerParticipants(Integer eventId) {
        Map<Integer, WinnerParticipant> participants = new LinkedHashMap<>();

        eventWinnerRepo.findByEvent_IdOrderByRankAsc(eventId).forEach(winner -> {
            if (winner.getParticipant() != null) {
                participants.putIfAbsent(
                        winner.getParticipant().getId(),
                        new WinnerParticipant(winner.getParticipant(), winner.getRank())
                );
            }

            if (winner.getTeam() != null) {
                teamParticipants(winner.getTeam()).forEach(participant -> participants.putIfAbsent(
                        participant.getId(),
                        new WinnerParticipant(participant, winner.getRank())
                ));
            }
        });

        return participants;
    }

    private List<Participant> participatedParticipants(Integer eventId) {
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

    private List<Participant> teamParticipants(EventTeam team) {
        List<Participant> participants = new ArrayList<>();
        participants.add(team.getLeader());
        participants.addAll(team.getMembers()
                .stream()
                .map(TeamMember::getParticipant)
                .toList());
        return participants;
    }

    public byte[] downloadCertificate(Integer certificateId, Authentication authentication) {
        Certificate certificate = certificateRepo.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate not found."));

        boolean isOwner = certificate.getParticipant().getEmail().equals(authentication.getName());
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot download this certificate.");
        }

        return certificatePdfService.generate(certificate);
    }

    private Certificate createCertificate(
            Event event,
            Participant participant,
            CertificateType certificateType,
            Integer rank
    ) {
        Certificate certificate = new Certificate();
        certificate.setEvent(event);
        certificate.setParticipant(participant);
        certificate.setCertificateType(certificateType);
        certificate.setRank(rank);
        certificate.setCertificateNumber("CERT-" + event.getId() + "-" + participant.getId() + "-" + UUID.randomUUID());

        return certificateRepo.save(certificate);
    }

    private CertificateType parseCertificateType(String certificateType) {
        if (certificateType == null || certificateType.isBlank()) {
            return CertificateType.PARTICIPATION;
        }

        try {
            return CertificateType.valueOf(certificateType.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid certificate type.");
        }
    }

    public CertificateResponse toResponse(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                eventService.toEventResponse(certificate.getEvent()),
                authService.toUserResponse(certificate.getParticipant()),
                certificate.getCertificateType().name().toLowerCase(Locale.ROOT),
                certificate.getRank(),
                certificate.getCertificateNumber(),
                certificate.getGeneratedAt()
        );
    }

    private record WinnerParticipant(Participant participant, Integer rank) {
    }

    private record CertificateResult(Certificate certificate, boolean created) {
    }
}
