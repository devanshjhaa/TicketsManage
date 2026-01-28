package com.ticketsmanage.backend.ticket.repository;

import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<TicketEntity, UUID> {

    List<TicketEntity> findByOwnerId(UUID ownerId);

    List<TicketEntity> findByAssigneeId(UUID assigneeId);

    List<TicketEntity> findByStatus(TicketStatus status);
}
