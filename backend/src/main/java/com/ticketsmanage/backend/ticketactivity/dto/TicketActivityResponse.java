package com.ticketsmanage.backend.ticketactivity.dto;

import java.time.Instant;
import java.util.UUID;

public record TicketActivityResponse(
        UUID id,
        String action,
        String details,
        String actorEmail,
        Instant createdAt
) {}
