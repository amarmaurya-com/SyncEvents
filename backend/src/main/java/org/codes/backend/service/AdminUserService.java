package org.codes.backend.service;

import jakarta.transaction.Transactional;
import org.codes.backend.dto.AdminUserRequest;
import org.codes.backend.dto.UserResponse;
import org.codes.backend.model.*;
import org.codes.backend.repository.AdminRepo;
import org.codes.backend.repository.CoordinatorRepo;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class AdminUserService {

    private final AdminRepo adminRepo;
    private final CoordinatorRepo coordinatorRepo;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            AdminRepo adminRepo,
            CoordinatorRepo coordinatorRepo,
            AuthService authService,
            PasswordEncoder passwordEncoder
    ) {
        this.adminRepo = adminRepo;
        this.coordinatorRepo = coordinatorRepo;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getUsersByRole(String role) {

        Roles parsedRole = parseRole(role);

        switch (parsedRole) {

            case ADMIN:
                return adminRepo.findAll()
                        .stream()
                        .map(authService::toUserResponse)
                        .toList();

            case COORDINATOR:
                return coordinatorRepo.findAll()
                        .stream()
                        .map(authService::toUserResponse)
                        .toList();

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only admin and coordinator users can be listed here."
                );
        }
    }

    public UserResponse createUser(AdminUserRequest request) {

        Roles role = parseRole(request.role());

        String email = requireValue(
                request.email(),
                "Email is required."
        ).toLowerCase(Locale.ROOT);

        if (authService.emailExists(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists."
            );
        }

        return switch (role) {

            case ADMIN -> createAdmin(request, email);

            case COORDINATOR -> createCoordinator(request, email);

            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only admin and coordinator users can be created here."
            );
        };
    }

    private UserResponse createAdmin(
            AdminUserRequest request,
            String email
    ) {

        String adminId = requireValue(
                request.adminId(),
                "Admin ID is required."
        );

        if (adminRepo.existsByAdminId(adminId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Admin ID is already registered."
            );
        }

        Admin admin = new Admin();

        applyCommonFields(
                admin,
                request,
                email,
                Roles.ADMIN
        );

        admin.setAdminId(adminId);

        return authService.toUserResponse(
                adminRepo.save(admin)
        );
    }

    private UserResponse createCoordinator(
            AdminUserRequest request,
            String email
    ) {

        String coordinatorId = requireValue(
                request.coordinatorId(),
                "Coordinator ID is required."
        );

        if (coordinatorRepo.existsByCoordinatorId(coordinatorId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Coordinator ID is already registered."
            );
        }

        Coordinator coordinator = new Coordinator();

        applyCommonFields(
                coordinator,
                request,
                email,
                Roles.COORDINATOR
        );

        coordinator.setCoordinatorId(coordinatorId);

        return authService.toUserResponse(
                coordinatorRepo.save(coordinator)
        );
    }

    private void applyCommonFields(
            BaseUser user,
            AdminUserRequest request,
            String email,
            Roles role
    ) {

        user.setName(request.name().trim());

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        request.password()
                )
        );

        user.setRole(role);

        user.setGender(
                parseGender(request.gender())
        );

        user.setInstitution(
                request.institution().trim()
        );

        user.setContact(
                request.contactNumber().trim()
        );

        user.setIsActive(true);
    }

    private String requireValue(
            String value,
            String message
    ) {

        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    message
            );
        }

        return value.trim();
    }

    private Roles parseRole(String role) {

        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role is required."
            );
        }

        try {

            return Roles.valueOf(
                    role.trim()
                            .toUpperCase(Locale.ROOT)
            );

        } catch (RuntimeException ex) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid role."
            );
        }
    }

    private Gender parseGender(String value) {

        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Gender is required."
            );
        }

        try {

            return Gender.valueOf(
                    value.trim()
                            .toUpperCase(Locale.ROOT)
            );

        } catch (RuntimeException ex) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid gender."
            );
        }
    }
}