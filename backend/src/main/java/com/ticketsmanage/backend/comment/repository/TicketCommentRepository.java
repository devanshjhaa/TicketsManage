package com.ticketsmanage.backend.comment.repository;

import com.ticketsmanage.backend.comment.entity.TicketCommentEntity;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TicketCommentRepository
        extends JpaRepository<TicketCommentEntity, UUID> {

    @Query("""
        select c
        from TicketCommentEntity c
        join fetch c.author
        where c.ticket = :ticket
        order by c.createdAt asc
    """)
    List<TicketCommentEntity> findByTicketWithAuthor(
            @Param("ticket") TicketEntity ticket
    );
}
