package org.codes.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "coordinators",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
@SuperBuilder
public class Coordinator extends BaseUser{
    @NotBlank(message = "coordinatorsId is required")
    @Column(nullable = false, unique = true)
    private String coordinatorId;
}
