package com.ticketsmanage.backend.notification.event;

import java.util.UUID;

public record CommentAddedEvent(
        UUID ticketId,
        UUID actorId
) {
}
