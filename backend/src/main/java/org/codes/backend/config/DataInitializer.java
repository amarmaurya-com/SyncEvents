package org.codes.backend.config;

import org.codes.backend.model.Admin;
import org.codes.backend.model.Gender;
import org.codes.backend.model.Roles;
import org.codes.backend.repository.AdminRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initAdmin(
            AdminRepo adminRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (!adminRepo.existsByEmail("admin@smartevent.local")) {
                Admin admin = new Admin();

                admin.setName("Super Admin");
                admin.setEmail("admin@smartevent.local");
                admin.setAdminId("ADM001");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Roles.ADMIN);
                admin.setGender(Gender.OTHER);
                admin.setInstitution("System");
                admin.setContact("9999999999");
                admin.setIsActive(true);

                adminRepo.save(admin);
                System.out.println("Default Admin Created");
            }
        };
    }
}
