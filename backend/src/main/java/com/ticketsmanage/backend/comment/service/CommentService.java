package com.ticketsmanage.backend.comment.service;

import com.ticketsmanage.backend.comment.dto.CommentResponse;
import com.ticketsmanage.backend.comment.dto.CreateCommentRequest;
import com.ticketsmanage.backend.comment.entity.TicketCommentEntity;
import com.ticketsmanage.backend.comment.repository.TicketCommentRepository;
import com.ticketsmanage.backend.security.util.SecurityUtils;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.dto.UserSummaryDto;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;

    // -------------------------
    // ADD COMMENT
    // -------------------------
    @Transactional
    public CommentResponse addComment(
            UUID ticketId,
            CreateCommentRequest request
    ) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        validateCanAccess(ticket, currentUser);

        TicketCommentEntity comment = new TicketCommentEntity();
        comment.setTicket(ticket);
        comment.setAuthor(currentUser);
        comment.setContent(request.content());

        TicketCommentEntity saved = commentRepository.save(comment);

        return toResponse(saved);
    }

    // -------------------------
    // GET COMMENTS
    // -------------------------
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForTicket(UUID ticketId) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        validateCanAccess(ticket, currentUser);

        return commentRepository.findByTicketWithAuthor(ticket)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // -------------------------
    // SECURITY HELPERS
    // -------------------------
    private UserEntity getCurrentUser() {

        String email = SecurityUtils.getCurrentUsername();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Authenticated user not found")
                );
    }

    private void validateCanAccess(
            TicketEntity ticket,
            UserEntity user
    ) {

        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        boolean isOwner =
                ticket.getOwner().getId().equals(user.getId());

        boolean isAssignee =
                ticket.getAssignee() != null &&
                        ticket.getAssignee().getId().equals(user.getId());

        if (!(isAdmin || isOwner || isAssignee)) {
            throw new AccessDeniedException(
                    "You cannot comment on this ticket"
            );
        }
    }

    // -------------------------
    // MAPPING
    // -------------------------
    private CommentResponse toResponse(
            TicketCommentEntity entity
    ) {

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
