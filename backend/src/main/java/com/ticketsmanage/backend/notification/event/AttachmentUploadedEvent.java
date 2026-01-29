package com.ticketsmanage.backend.notification.event;

import java.util.UUID;

public record AttachmentUploadedEvent(
        UUID ticketId,
        UUID uploaderId
) {
}
