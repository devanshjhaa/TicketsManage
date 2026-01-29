package com.ticketsmanage.backend.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(

        @NotNull
        Boolean active
) {}
