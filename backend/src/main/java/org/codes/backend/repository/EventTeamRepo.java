package org.codes.backend.repository;

import org.codes.backend.model.EventTeam;
import org.codes.backend.model.TeamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTeamRepo extends JpaRepository<EventTeam, Integer> {
    @Query("""
            select distinct team from EventTeam team
            left join team.members member
            where team.leader.id = :participantId
               or member.participant.id = :participantId
            """)
    List<EventTeam> findByParticipant(@Param("participantId") Integer participantId);

    @Query("""
            select count(team) > 0 from EventTeam team
            left join team.members member
            where team.event.id = :eventId
              and team.status <> :cancelledStatus
              and (
                    team.leader.id = :participantId
                    or member.participant.id = :participantId
              )
            """)
    boolean existsActiveTeamForParticipant(
            @Param("eventId") Integer eventId,
            @Param("participantId") Integer participantId,
            @Param("cancelledStatus") TeamStatus cancelledStatus
    );
}
