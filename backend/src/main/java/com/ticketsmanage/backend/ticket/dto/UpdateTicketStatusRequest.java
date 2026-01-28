package com.ticketsmanage.backend.ticket.dto;

import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequest(

        @NotNull
        TicketStatus status
) {}
