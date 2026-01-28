package com.ticketsmanage.backend.audit.service;

import com.ticketsmanage.backend.audit.dto.AuditLogResponse;
import com.ticketsmanage.backend.audit.entity.AuditLogEntity;
import com.ticketsmanage.backend.audit.repository.AuditLogRepository;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.dto.UserSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final TicketRepository ticketRepository;

    public List<AuditLogResponse> getLogsForTicket(UUID ticketId) {

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return auditLogRepository.findByTicket(ticket)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(AuditLogEntity entity) {

        UserSummaryDto actor = null;

        if (entity.getActor() != null) {
            actor = new UserSummaryDto(
                    entity.getActor().getId(),
                    entity.getActor().getEmail(),
                    entity.getActor().getFirstName(),
                    entity.getActor().getLastName()
            );
        }

        return new AuditLogResponse(
                entity.getId(),
                entity.getTicket() != null ? entity.getTicket().getId() : null,
                entity.getAction(),
                entity.getOldValue(),
                entity.getNewValue(),
                actor,
                entity.getCreatedAt()
        );
    }
}
