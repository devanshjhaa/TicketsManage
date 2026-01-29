package com.ticketsmanage.backend.ticketactivity.repository;

import com.ticketsmanage.backend.ticketactivity.entity.TicketActivityEntity;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketActivityRepository
        extends JpaRepository<TicketActivityEntity, UUID> {

    List<TicketActivityEntity> findByTicketOrderByCreatedAtAsc(
            TicketEntity ticket
    );
}
