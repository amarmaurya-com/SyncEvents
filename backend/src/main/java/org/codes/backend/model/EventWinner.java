package org.codes.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "event_winners",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"event_id", "rank"}),
                @UniqueConstraint(columnNames = {"event_id", "participant_id"}),
                @UniqueConstraint(columnNames = {"event_id", "team_id"})
        }
)
public class EventWinner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "participant_id")
    private Participant participant;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private EventTeam team;

    @Column(nullable = false)
    private Integer rank;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
