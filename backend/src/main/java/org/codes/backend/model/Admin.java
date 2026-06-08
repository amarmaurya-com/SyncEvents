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
        name = "admin",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
@SuperBuilder
public class Admin extends BaseUser{
    @NotBlank(message = "Admin_Id is required")
    @Column(nullable = false, unique = true)
    private String adminId;
}
