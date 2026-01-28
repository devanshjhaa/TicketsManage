package com.ticketsmanage.backend.audit.dto;

import com.ticketsmanage.backend.user.dto.UserSummaryDto;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID ticketId,
        String action,
        String oldValue,
        String newValue,
        UserSummaryDto actor,
        Instant createdAt
) {}
