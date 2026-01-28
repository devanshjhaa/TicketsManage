package com.ticketsmanage.backend.audit.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateAuditLogRequest(

        UUID ticketId,

        @NotBlank
        String action,

        String oldValue,
        String newValue
) {}
