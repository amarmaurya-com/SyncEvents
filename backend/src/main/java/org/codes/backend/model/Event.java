package org.codes.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Event name required")
    @Column(nullable = false, unique = true)
    private String name;

    @NotBlank(message = "Description required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING) // Saves enum name (e.g., "OTHER") instead of index
    private EventType eventType = EventType.OTHER;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING) // Saves enum name (e.g., "INDIVIDUAL") instead of index
    private ParticipationType participationType = ParticipationType.INDIVIDUAL;

    private LocalDateTime registrationStartDate;
    private LocalDateTime registrationEndDate;
    private LocalDateTime eventDate;
    private String venue;
    private int maxParticipants;

    @Column(columnDefinition = "TEXT")
    private String rules;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_prizes", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "prize")
    @Builder.Default // Ensures Lombok Builder doesn't overwrite your initialization with null
    private List<String> prizes = new ArrayList<>();

    @Column(nullable = false)
    @Enumerated(EnumType.STRING) // Saves enum name (e.g., "DRAFT") instead of index
    private EventStatus status = EventStatus.DRAFT;

    @Embedded
    private TeamConfig teamConfig;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "event_coordinators",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "coordinator_id")
    )
    @Builder.Default // Ensures Lombok Builder doesn't overwrite your initialization with null
    private Set<Coordinator> coordinators = new HashSet<>();
}
