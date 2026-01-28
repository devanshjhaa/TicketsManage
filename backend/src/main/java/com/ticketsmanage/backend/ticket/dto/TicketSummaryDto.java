package com.ticketsmanage.backend.ticket.dto;

import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record TicketSummaryDto(
        UUID id,
        String title,
        TicketStatus status,
        TicketPriority priority,
        Instant createdAt
) {}
