package org.codes.backend.controller;

import jakarta.validation.Valid;
import org.codes.backend.dto.AdminUserRequest;
import org.codes.backend.dto.UsersResponse;
import org.codes.backend.service.AdminUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminUserService adminUserService;

    public AdminController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    //  GET ADMIN, COORDINATOR
    @GetMapping("/users")
    public UsersResponse getUsers(@RequestParam String role) {
        return new UsersResponse(adminUserService.getUsersByRole(role));
    }

    //  CREATE ADMIN, COORDINATOR
    @PostMapping("/users")
    public UsersResponse createUser(@Valid @RequestBody AdminUserRequest request) {
        return new UsersResponse(List.of(adminUserService.createUser(request)));
    }
}
