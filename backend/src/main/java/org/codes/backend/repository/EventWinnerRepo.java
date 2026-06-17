package org.codes.backend.repository;

import org.codes.backend.model.EventWinner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventWinnerRepo extends JpaRepository<EventWinner, Integer> {
    List<EventWinner> findByEvent_IdOrderByRankAsc(Integer eventId);

    Optional<EventWinner> findByEvent_IdAndRank(Integer eventId, Integer rank);

    Optional<EventWinner> findByEvent_IdAndParticipant_Id(Integer eventId, Integer participantId);

    Optional<EventWinner> findByEvent_IdAndTeam_Id(Integer eventId, Integer teamId);

    void deleteByEvent_Id(Integer eventId);
}
