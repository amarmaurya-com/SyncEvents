package org.codes.backend.repository;

import org.codes.backend.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepo extends JpaRepository<Participant, Integer> {

    Optional<Participant> findByEmail(String email);

    Optional<Participant> findByParticipantId(String participantId);

    List<Participant> findByParticipantIdContainingIgnoreCase(String participantId);

    boolean existsByEmail(String email);

    boolean existsByParticipantId(String participantId);
}
