package com.ticketsmanage.backend.ticket.repository;

import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.user.entity.UserEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository
        extends JpaRepository<TicketEntity, UUID> {

    // --------------------------------------------------
    // BASIC
    // --------------------------------------------------

    List<TicketEntity> findByOwner(UserEntity owner);

    List<TicketEntity> findByAssignee(UserEntity assignee);

    Optional<TicketEntity> findByIdAndDeletedFalse(UUID id);

    // --------------------------------------------------
    // PAGED + SOFT DELETE
    // --------------------------------------------------

    Page<TicketEntity> findByDeletedFalse(Pageable pageable);

    Page<TicketEntity> findByOwnerAndDeletedFalse(
            UserEntity owner,
            Pageable pageable
    );

    Page<TicketEntity> findByAssigneeAndDeletedFalse(
            UserEntity assignee,
            Pageable pageable
    );

    Page<TicketEntity> findByStatusAndDeletedFalse(
            TicketStatus status,
            Pageable pageable
    );

    Page<TicketEntity> findByPriorityAndDeletedFalse(
            TicketPriority priority,
            Pageable pageable
    );

    // --------------------------------------------------
    // SEARCH COMBINATIONS
    // --------------------------------------------------

    Page<TicketEntity> findByStatusAndPriorityAndDeletedFalse(
            TicketStatus status,
            TicketPriority priority,
            Pageable pageable
    );

    Page<TicketEntity> findByOwnerAndStatusAndDeletedFalse(
            UserEntity owner,
            TicketStatus status,
            Pageable pageable
    );

    Page<TicketEntity> findByOwnerAndPriorityAndDeletedFalse(
            UserEntity owner,
            TicketPriority priority,
            Pageable pageable
    );

    Page<TicketEntity> findByOwnerAndStatusAndPriorityAndDeletedFalse(
            UserEntity owner,
            TicketStatus status,
            TicketPriority priority,
            Pageable pageable
    );

    // --------------------------------------------------
    // DASHBOARD METRICS
    // --------------------------------------------------

    long countByDeletedFalse();

    long countByDeletedTrue();

    long countByStatusAndDeletedFalse(TicketStatus status);

    long countByPriorityAndDeletedFalse(TicketPriority priority);

    // Average resolution time (seconds)
    @Query(value = """
        select avg(extract(epoch from (resolved_at - created_at)))
        from tickets
        where status = 'RESOLVED'
          and deleted = false
    """, nativeQuery = true)
    Double averageResolutionSeconds();

    // Tickets per agent
    @Query("""
        select t.assignee.id, count(t)
        from TicketEntity t
        where t.assignee is not null
          and t.deleted = false
        group by t.assignee.id
    """)
    List<Object[]> countTicketsPerAgent();
}
