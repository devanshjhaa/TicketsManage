package com.ticketsmanage.backend.audit.repository;

import com.ticketsmanage.backend.audit.entity.AuditLogEntity;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository
        extends JpaRepository<AuditLogEntity, UUID> {

    List<AuditLogEntity> findByTicket(TicketEntity ticket);
}
