package org.codes.backend.dto;

import java.util.List;

public record CertificateBatchResponse(
        List<CertificateResponse> certificates,
        int createdCount,
        int skippedCount,
        int totalEligible
) {
}
