package com.ticketsmanage.backend.ticket.dto;

import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTicketRequest(

        @NotBlank
        String title,

        String description,

        @NotNull
        TicketPriority priority
) {}
