package org.codes.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "participants",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
public class Participant extends BaseUser{
    @NotBlank(message = "ParticipantId is required")
    @Column(nullable = false, unique = true)
    private String participantId;
}
