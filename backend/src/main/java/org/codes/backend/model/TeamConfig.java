package org.codes.backend.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TeamConfig {
    private int minSize;
    private int maxSize;
    private String genderRequired;
    private boolean allowCrossInstitution;
}
