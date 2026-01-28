package com.ticketsmanage.backend.user.dto;

import java.util.UUID;

public record UserSummaryDto(
        UUID id,
        String email,
        String firstName,
        String lastName
) {}
