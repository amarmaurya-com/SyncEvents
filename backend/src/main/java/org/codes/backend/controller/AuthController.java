package org.codes.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.codes.backend.dto.AuthResponse;
import org.codes.backend.dto.LoginRequest;
import org.codes.backend.dto.MessageResponse;
import org.codes.backend.dto.RegisterParticipantRequest;
import org.codes.backend.model.BaseUser;
import org.codes.backend.service.AuthService;
import org.codes.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String AUTH_COOKIE = "sync_events_token";

    private final AuthService authService;
    private final JwtService jwtService;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            @Value("${app.cookie.secure:false}") boolean cookieSecure,
            @Value("${app.cookie.same-site:Lax}") String cookieSameSite
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterParticipantRequest request) {
        BaseUser user = authService.registerParticipant(request);
        return authenticatedResponse("Registration successful.", user);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        BaseUser user = authService.login(request);
        return authenticatedResponse("Login successful.", user);
    }

    @GetMapping("/me")
    public AuthResponse me(@CookieValue(name = AUTH_COOKIE, required = false) String token) {
        BaseUser user = authService.getCurrentUser(token, jwtService);
        return new AuthResponse("Session active.", authService.toUserResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie().toString())
                .body(new MessageResponse("Logged out successfully."));
    }

    private ResponseEntity<AuthResponse> authenticatedResponse(String message, BaseUser user) {
        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie(token).toString())
                .body(new AuthResponse(message, authService.toUserResponse(user)));
    }

    private ResponseCookie authCookie(String token) {
        return ResponseCookie.from(AUTH_COOKIE, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(Duration.ofDays(1))
                .build();
    }

    private ResponseCookie expiredCookie() {
        return ResponseCookie.from(AUTH_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }
}
