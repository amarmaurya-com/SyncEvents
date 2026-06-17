package org.codes.backend.service;

import org.codes.backend.dto.CertificateBatchRequest;
import org.codes.backend.dto.CertificateResponse;
import org.codes.backend.model.Certificate;
import org.codes.backend.model.CertificateType;
import org.codes.backend.model.Event;
import org.codes.backend.model.Participant;
import org.codes.backend.model.Registration;
import org.codes.backend.model.RegistrationStatus;
import org.codes.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CertificateService {
    private final CertificateRepo certificateRepo;
    private final ParticipantRepo participantRepo;
    private final EventRepo eventRepo;
    private final RegistrationRepo registrationRepo;
    private final EventService eventService;
    private final AuthService authService;
    private final EventWinnerRepo eventWinnerRepo;
    private final CertificatePdfService certificatePdfService;

    public CertificateService(
            CertificateRepo certificateRepo,
            ParticipantRepo participantRepo,
            EventRepo eventRepo,
            RegistrationRepo registrationRepo,
            EventService eventService,
            AuthService authService,
            EventWinnerRepo eventWinnerRepo,
            CertificatePdfService certificatePdfService
            ) {
        this.certificateRepo = certificateRepo;
        this.participantRepo = participantRepo;
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
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
    public List<CertificateResponse> generateBatch(Integer eventId, CertificateBatchRequest request) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        CertificateType certificateType = parseCertificateType(request.certificateType());

        if(certificateType == CertificateType.ACHIEVEMENT){
            return eventWinnerRepo.findByEvent_IdOrderByRankAsc(eventId)
                    .stream()
                    .filter(winner -> winner.getParticipant()!=null)
                    .map(winner -> certificateRepo
                            .findByEvent_IdAndParticipant_IdAndCertificateType(
                                    eventId,
                                    winner.getParticipant().getId(),
                                    certificateType
                            ).orElseGet(()-> createCertificate(
                                    event,
                                    winner.getParticipant(),
                                    certificateType,
                                    winner.getRank()
                            )))
                    .map(this::toResponse)
                    .toList();
        }

        return registrationRepo.findByEvent_IdAndStatus(eventId, RegistrationStatus.APPROVED)
                .stream()
                .filter(registration -> eventWinnerRepo
                        .findByEvent_IdAndParticipant_Id(eventId, registration.getParticipant().getId())
                        .isEmpty())
                .map(registration -> certificateRepo
                        .findByEvent_IdAndParticipant_IdAndCertificateType(
                                eventId,
                                registration.getParticipant().getId(),
                                certificateType
                        )
                        .orElseGet(() -> createCertificate(
                                event,
                                registration.getParticipant(),
                                certificateType,
                                null
                        )))
                .map(this::toResponse)
                .toList();
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
}
