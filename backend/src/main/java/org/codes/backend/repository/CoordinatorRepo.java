package org.codes.backend.repository;

import org.codes.backend.model.Coordinator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoordinatorRepo extends JpaRepository<Coordinator, Integer> {

    Optional<Coordinator> findByEmail(String email);

    Optional<Coordinator> findByCoordinatorId(String coordId);

    boolean existsByEmail(String email);

    boolean existsByCoordinatorId(String coordinatorId);
}
