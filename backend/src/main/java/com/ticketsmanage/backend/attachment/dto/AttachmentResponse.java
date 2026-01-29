package com.ticketsmanage.backend.attachment.dto;

import java.time.Instant;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        String fileName,
        String contentType,
        long fileSize,
        Instant createdAt
) {}
