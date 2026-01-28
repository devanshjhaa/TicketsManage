package com.ticketsmanage.backend.comment.service;

import com.ticketsmanage.backend.comment.dto.CommentResponse;
import com.ticketsmanage.backend.comment.dto.CreateCommentRequest;
import com.ticketsmanage.backend.comment.entity.TicketCommentEntity;
import com.ticketsmanage.backend.comment.repository.TicketCommentRepository;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.dto.UserSummaryDto;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;

    public CommentResponse addComment(UUID ticketId, CreateCommentRequest request) {

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // TODO later replace with authenticated user
        UserEntity author = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No users exist"));

        TicketCommentEntity comment = new TicketCommentEntity();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(request.content());

        TicketCommentEntity saved = commentRepository.save(comment);

        return toResponse(saved);
    }

    public List<CommentResponse> getCommentsForTicket(UUID ticketId) {

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return commentRepository.findByTicket(ticket)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CommentResponse toResponse(TicketCommentEntity entity) {

        return new CommentResponse(
                entity.getId(),
                entity.getContent(),
                new UserSummaryDto(
                        entity.getAuthor().getId(),
                        entity.getAuthor().getEmail(),
                        entity.getAuthor().getFirstName(),
                        entity.getAuthor().getLastName()
                ),
                entity.getCreatedAt()
        );
    }
}
