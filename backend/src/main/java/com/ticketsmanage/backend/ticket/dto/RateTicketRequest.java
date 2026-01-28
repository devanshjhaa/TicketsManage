package com.ticketsmanage.backend.ticket.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RateTicketRequest(

        @NotNull
        @Min(1)
        @Max(5)
        Integer rating,

        String comment
) {}
