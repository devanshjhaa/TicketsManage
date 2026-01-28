package com.ticketsmanage.backend.ticket.dto;

import com.ticketsmanage.backend.user.dto.UserSummaryDto;

import java.time.Instant;
import java.util.UUID;

public record TicketCommentResponse(
        UUID id,
        String message,
        UserSummaryDto author,
        Instant createdAt
) {}
