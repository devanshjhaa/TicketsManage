package com.ticketsmanage.backend.user.dto;

import com.ticketsmanage.backend.user.entity.UserRole;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(

        @NotNull
        UserRole role
) {}
