package org.codes.backend.controller;

import org.codes.backend.dto.CertificateBatchRequest;
import org.codes.backend.dto.CertificateBatchResponse;
import org.codes.backend.dto.CertificateResponse;
import org.codes.backend.service.CertificateService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {
    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public Map<String, List<CertificateResponse>> getMyCertificates(Authentication authentication) {
        return Map.of("certificates", certificateService.getMyCertificates(authentication.getName()));
    }

    @PostMapping("/events/{eventId}/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public CertificateBatchResponse generateBatch(
            @PathVariable Integer eventId,
            @RequestBody CertificateBatchRequest request
    ) {
        return certificateService.generateBatch(eventId, request);
    }

    @GetMapping("/{certificateId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARTICIPANT')")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Integer certificateId,
            Authentication authentication
    ) {
        byte[] file = certificateService.downloadCertificate(certificateId, authentication);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate-" + certificateId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}
