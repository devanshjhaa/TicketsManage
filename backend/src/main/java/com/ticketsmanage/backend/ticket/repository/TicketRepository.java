package com.ticketsmanage.backend.ticket.repository;

import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.user.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity, UUID>,
                org.springframework.data.jpa.repository.JpaSpecificationExecutor<TicketEntity> {

        // BASIC
        List<TicketEntity> findByOwner(UserEntity owner);

        List<TicketEntity> findByAssignee(UserEntity assignee);

        // WITH SOFT DELETE
        Optional<TicketEntity> findByIdAndDeletedFalse(UUID id);

        List<TicketEntity> findByOwnerAndDeletedFalse(UserEntity owner);

        List<TicketEntity> findByAssigneeAndDeletedFalse(UserEntity assignee);

        Page<TicketEntity> findByDeletedFalse(Pageable pageable);

        Page<TicketEntity> findByOwnerAndDeletedFalse(
                        UserEntity owner,
                        Pageable pageable);

        Page<TicketEntity> findByAssigneeAndDeletedFalse(
                        UserEntity assignee,
                        Pageable pageable);

        // FILTERING
        Page<TicketEntity> findByStatusAndDeletedFalse(
                        TicketStatus status,
                        Pageable pageable);

        Page<TicketEntity> findByPriorityAndDeletedFalse(
                        TicketPriority priority,
                        Pageable pageable);

        Page<TicketEntity> findByStatusAndPriorityAndDeletedFalse(
                        TicketStatus status,
                        TicketPriority priority,
                        Pageable pageable);

        Page<TicketEntity> findByOwnerAndStatusAndDeletedFalse(
                        UserEntity owner,
                        TicketStatus status,
                        Pageable pageable);

        Page<TicketEntity> findByOwnerAndPriorityAndDeletedFalse(
                        UserEntity owner,
                        TicketPriority priority,
                        Pageable pageable);

        Page<TicketEntity> findByOwnerAndStatusAndPriorityAndDeletedFalse(
                        UserEntity owner,
                        TicketStatus status,
                        TicketPriority priority,
                        Pageable pageable);

        // DASHBOARD STATS (already referenced earlier)
        long countByDeletedFalse();

        long countByDeletedTrue();

        long countByStatusAndDeletedFalse(TicketStatus status);

        long countByPriorityAndDeletedFalse(TicketPriority priority);
}
