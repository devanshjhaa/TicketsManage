package com.ticketsmanage.backend.comment.repository;

import com.ticketsmanage.backend.comment.entity.TicketCommentEntity;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketCommentRepository
        extends JpaRepository<TicketCommentEntity, UUID> {

    List<TicketCommentEntity> findByTicket(TicketEntity ticket);
}
