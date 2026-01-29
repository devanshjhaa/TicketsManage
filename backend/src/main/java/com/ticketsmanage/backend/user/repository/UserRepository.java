package com.ticketsmanage.backend.user.repository;

import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByGoogleId(String googleId);

    Page<UserEntity> findAll(Pageable pageable);

    Page<UserEntity> findAllByActive(Boolean isActive, Pageable pageable);

    boolean existsByRole(UserRole role);
}
