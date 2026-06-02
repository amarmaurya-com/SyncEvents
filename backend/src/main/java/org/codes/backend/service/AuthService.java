package org.codes.backend.service;

import org.codes.backend.dto.LoginRequest;
import org.codes.backend.dto.RegisterParticipantRequest;
import org.codes.backend.dto.UserResponse;
import org.codes.backend.model.Admin;
import org.codes.backend.model.BaseUser;
import org.codes.backend.model.Coordinator;
import org.codes.backend.model.Gender;
import org.codes.backend.model.Participant;
import org.codes.backend.model.Roles;
import org.codes.backend.repository.AdminRepo;
import org.codes.backend.repository.CoordinatorRepo;
import org.codes.backend.repository.ParticipantRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {
    private final ParticipantRepo participantRepo;
    private final CoordinatorRepo coordinatorRepo;
    private final AdminRepo adminRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            ParticipantRepo participantRepo,
            CoordinatorRepo coordinatorRepo,
            AdminRepo adminRepo,
            PasswordEncoder passwordEncoder
    ) {
        this.participantRepo = participantRepo;
        this.coordinatorRepo = coordinatorRepo;
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public Participant registerParticipant(RegisterParticipantRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String studentId = request.studentId().trim();

        if (emailExists(email)) {
            throw new ResponseStatusException(CONFLICT, "Email is already registered.");
        }

        if (participantRepo.existsByParticipantId(studentId)) {
            throw new ResponseStatusException(CONFLICT, "Student ID is already registered.");
        }

        Participant participant = new Participant();
        participant.setName(request.name().trim());
        participant.setEmail(email);
        participant.setPassword(passwordEncoder.encode(request.password()));
        participant.setGender(parseGender(request.gender()));
        participant.setRole(Roles.PARTICIPANT);
        participant.setInstitution(request.institution().trim());
        participant.setContact(request.contactNumber().trim());
        participant.setParticipantId(studentId);

        return participantRepo.save(participant);
    }

    public BaseUser login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        BaseUser user = findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid email or password."));

        if (!Boolean.TRUE.equals(user.getIsActive()) || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid email or password.");
        }

        return user;
    }

    public BaseUser getCurrentUser(String token, JwtService jwtService) {
        if (token == null || token.isBlank() || !jwtService.isValid(token)) {
            throw new ResponseStatusException(UNAUTHORIZED, "No active session.");
        }

        String email = jwtService.extractEmail(token);
        return findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "No active session."));
    }

    public Optional<BaseUser> findByEmail(String email) {
        Optional<? extends BaseUser> participant = participantRepo.findByEmail(email);
        if (participant.isPresent()) {
            return Optional.of(participant.get());
        }

        Optional<? extends BaseUser> coordinator = coordinatorRepo.findByEmail(email);
        if (coordinator.isPresent()) {
            return Optional.of(coordinator.get());
        }

        Optional<? extends BaseUser> admin = adminRepo.findByEmail(email);
        return admin.map(baseUser -> baseUser);
    }

    public boolean emailExists(String email) {
        return participantRepo.existsByEmail(email)
                || coordinatorRepo.existsByEmail(email)
                || adminRepo.existsByEmail(email);
    }

    public UserResponse toUserResponse(BaseUser user) {
        String studentId = user instanceof Participant participant ? participant.getParticipantId() : null;
        String coordinatorId = user instanceof Coordinator coordinator ? coordinator.getCoordinatorId() : null;
        String adminId = user instanceof Admin admin ? admin.getAdminId() : null;

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                toClientValue(user.getRole()),
                toClientValue(user.getGender()),
                user.getInstitution(),
                user.getContact(),
                studentId,
                coordinatorId,
                adminId
        );
    }

    private Gender parseGender(String value) {
        try {
            return Gender.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid gender.");
        }
    }

    private String toClientValue(Enum<?> value) {
        return value == null ? null : value.name().toLowerCase(Locale.ROOT);
    }
}
