package com.ticketsmanage.backend.ticket.repository;

import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.user.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository
        extends JpaRepository<TicketEntity, UUID> {

    // -------------------------
    // BASIC FILTERING
    // -------------------------

    Page<TicketEntity> findByDeletedFalse(Pageable pageable);

    Page<TicketEntity> findByStatusAndDeletedFalse(
            TicketStatus status,
            Pageable pageable
    );

    Page<TicketEntity> findByPriorityAndDeletedFalse(
            TicketPriority priority,
            Pageable pageable
    );

    // -------------------------
    // USER BASED
    // -------------------------

    Page<TicketEntity> findByOwnerAndDeletedFalse(
            UserEntity owner,
            Pageable pageable
    );

    Page<TicketEntity> findByAssigneeAndDeletedFalse(
            UserEntity assignee,
            Pageable pageable
    );

    // -------------------------
    // NON PAGED (USED BY SERVICE)
    // -------------------------

    List<TicketEntity> findByOwner(UserEntity owner);

    List<TicketEntity> findByAssignee(UserEntity assignee);

    Optional<TicketEntity> findByIdAndDeletedFalse(UUID id);

    Page<TicketEntity> findByDeletedTrue(Pageable pageable);

}
