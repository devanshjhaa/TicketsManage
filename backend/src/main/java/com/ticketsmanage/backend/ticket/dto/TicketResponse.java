package com.ticketsmanage.backend.ticket.dto;

import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.user.dto.UserSummaryDto;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String title,
        String description,
        TicketStatus status,
        TicketPriority priority,
        UserSummaryDto owner,
        UserSummaryDto assignee,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt,
        Integer rating,
        String ratingComment
) {}
