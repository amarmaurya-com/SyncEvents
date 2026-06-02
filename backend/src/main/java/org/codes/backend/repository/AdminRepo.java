package org.codes.backend.repository;

import org.codes.backend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepo extends JpaRepository<Admin,Integer> {
    Optional<Admin> findByEmail(String email);

    Optional<Admin> findByAdminId(String AdminId);

    boolean existsByEmail(String email);

    boolean existsByAdminId(String adminId);
}
