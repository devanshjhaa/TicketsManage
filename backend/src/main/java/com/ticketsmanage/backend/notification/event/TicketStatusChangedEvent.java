package com.ticketsmanage.backend.notification.event;

import java.util.UUID;

public record TicketStatusChangedEvent(
        UUID ticketId,
        String newStatus,
        String ticketTitle,
        String ownerEmail,
        String priority
) {
}
