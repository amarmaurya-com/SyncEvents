package org.codes.backend.controller;

import org.codes.backend.dto.RegistrationResponse;
import org.codes.backend.service.RegistrationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
@PreAuthorize("hasRole('PARTICIPANT')")
public class RegistrationController {
    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping("/me")
    public Map<String, List<RegistrationResponse>> getMyRegistrations(Authentication authentication) {
        return Map.of("registrations", registrationService.getMyRegistrations(authentication.getName()));
    }

    @PostMapping
    public RegistrationResponse register(Authentication authentication, @RequestBody Map<String, Integer> body) {
        return registrationService.register(authentication.getName(), body.get("eventId"));
    }

    @DeleteMapping("/{registrationId}")
    public RegistrationResponse withdrawRegistration(
            Authentication authentication,
            @PathVariable Integer registrationId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body == null ? "" : body.get("reason");
        return registrationService.withdraw(authentication.getName(), registrationId, reason);
    }
}
