package com.ticketsmanage.backend.user.dto;

import com.ticketsmanage.backend.user.entity.UserRole;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        UserRole role,
        boolean active
) {}
