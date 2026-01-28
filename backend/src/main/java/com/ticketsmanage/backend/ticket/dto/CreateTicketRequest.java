package com.ticketsmanage.backend.ticket.dto;

import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateTicketRequest(

        @NotBlank
        String title,

        String description,

        @NotNull
        TicketPriority priority,

        @NotNull
        UUID ownerId
) {}
