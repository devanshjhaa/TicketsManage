package com.ticketsmanage.backend.ticket.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignTicketRequest(

        @NotNull
        UUID assigneeId
) {}
