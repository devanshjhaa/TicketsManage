package com.ticketsmanage.backend.attachment.repository;

import com.ticketsmanage.backend.attachment.entity.AttachmentEntity;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttachmentRepository
        extends JpaRepository<AttachmentEntity, UUID> {

    List<AttachmentEntity> findByTicketAndDeletedFalse(
            TicketEntity ticket
    );

    Optional<AttachmentEntity> findByIdAndDeletedFalse(
            UUID id
    );
}
