package org.codes.backend.repository;

import org.codes.backend.model.Certificate;
import org.codes.backend.model.CertificateType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepo extends JpaRepository<Certificate, Integer> {
    List<Certificate> findByParticipant_IdOrderByGeneratedAtDesc(Integer participantId);

    Optional<Certificate> findByEvent_IdAndParticipant_IdAndCertificateType(
            Integer eventId,
            Integer participantId,
            CertificateType certificateType
    );

    long countByEvent_Id(Integer eventId);

    long countByEvent_IdAndCertificateType(Integer eventId, CertificateType certificateType);

    List<Certificate> findTop10ByEvent_IdOrderByGeneratedAtDesc(Integer eventId);

    void deleteByEvent_Id(Integer eventId);
}