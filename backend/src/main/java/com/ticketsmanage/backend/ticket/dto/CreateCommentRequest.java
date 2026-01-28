package com.ticketsmanage.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
        @NotBlank String message
) {}
