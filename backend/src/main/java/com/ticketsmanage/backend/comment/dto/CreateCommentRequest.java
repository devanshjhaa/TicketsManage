package com.ticketsmanage.backend.comment.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(

        @NotBlank
        String content
) {}
