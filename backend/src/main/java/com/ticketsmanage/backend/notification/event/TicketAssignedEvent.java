package com.ticketsmanage.backend.notification.event;

import java.util.UUID;

public record TicketAssignedEvent(
        UUID ticketId,
        UUID assigneeId
) {
}
