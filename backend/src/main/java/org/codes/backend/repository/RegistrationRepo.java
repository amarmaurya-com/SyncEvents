package org.codes.backend.repository;

import org.codes.backend.model.Registration;
import org.codes.backend.model.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepo extends JpaRepository<Registration, Integer> {
    List<Registration> findByParticipant_Id(Integer participantId);

    List<Registration> findByEvent_Id(Integer eventId);

    List<Registration> findByEvent_IdAndStatus(Integer eventId, RegistrationStatus status);

    Optional<Registration> findByEvent_IdAndParticipant_Id(Integer eventId, Integer participantId);

    boolean existsByEvent_IdAndParticipant_IdAndStatusNot(
            Integer eventId,
            Integer participantId,
            RegistrationStatus status
    );

    long countByEvent_IdAndStatusNot(Integer eventId, RegistrationStatus status);

    void deleteByEvent_Id(Integer eventId);
}