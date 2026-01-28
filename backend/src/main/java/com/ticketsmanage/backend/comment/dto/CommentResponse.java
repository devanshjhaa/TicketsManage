package com.ticketsmanage.backend.comment.dto;

import com.ticketsmanage.backend.user.dto.UserSummaryDto;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        String content,
        UserSummaryDto author,
        Instant createdAt
) {}
