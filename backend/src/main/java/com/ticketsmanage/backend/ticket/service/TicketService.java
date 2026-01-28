package com.ticketsmanage.backend.ticket.service;

import com.ticketsmanage.backend.security.util.SecurityUtils;
import com.ticketsmanage.backend.ticket.dto.*;
import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.dto.UserSummaryDto;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // -------------------------
    // CREATE TICKET
    // -------------------------
    public TicketResponse createTicket(CreateTicketRequest request) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = new TicketEntity();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setOwner(currentUser);

        TicketEntity saved = ticketRepository.save(ticket);

        return toResponse(saved);
    }

    // -------------------------
    // GET MY TICKETS
    // -------------------------
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets() {

        UserEntity currentUser = getCurrentUser();

        return ticketRepository.findByOwner(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // -------------------------
    // GET ALL TICKETS (ROLE AWARE)
    // -------------------------
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {

        UserEntity currentUser = getCurrentUser();

        List<TicketEntity> tickets;

        if (currentUser.getRole() == UserRole.ADMIN) {
            tickets = ticketRepository.findAll();
        } else if (currentUser.getRole() == UserRole.SUPPORT_AGENT) {
            tickets = ticketRepository.findByAssignee(currentUser);
        } else {
            tickets = ticketRepository.findByOwner(currentUser);
        }

        return tickets.stream()
                .map(this::toResponse)
                .toList();
    }

    // -------------------------
    // GET TICKET BY ID (SECURED)
    // -------------------------
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(UUID id) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isOwner =
                ticket.getOwner().getId().equals(currentUser.getId());

        boolean isAssignee =
                ticket.getAssignee() != null &&
                        ticket.getAssignee().getId()
                                .equals(currentUser.getId());

        boolean isAdmin =
                currentUser.getRole() == UserRole.ADMIN;

        if (!(isOwner || isAssignee || isAdmin)) {
            throw new AccessDeniedException(
                    "You are not allowed to view this ticket"
            );
        }

        return toResponse(ticket);
    }

    // -------------------------
    // ASSIGN TICKET (ADMIN / SUPPORT ONLY)
    // -------------------------
    @Transactional
    public TicketResponse assignTicket(
            UUID ticketId,
            AssignTicketRequest request
    ) {

        UserEntity currentUser = getCurrentUser();

        if (!(currentUser.getRole() == UserRole.ADMIN ||
                currentUser.getRole() == UserRole.SUPPORT_AGENT)) {

            throw new AccessDeniedException(
                    "Only admins or support agents can assign tickets"
            );
        }

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        UserEntity assignee = userRepository.findById(
                request.assigneeId()
        ).orElseThrow(() ->
                new RuntimeException("Assignee not found"));

        if (assignee.getRole() != UserRole.SUPPORT_AGENT) {
            throw new RuntimeException(
                    "Assignee must be a support agent"
            );
        }

        ticket.setAssignee(assignee);

        TicketEntity saved = ticketRepository.save(ticket);

        return toResponse(saved);
    }

    // -------------------------
    // UPDATE STATUS (ADMIN / SUPPORT ONLY)
    // -------------------------
    @Transactional
    public TicketResponse updateStatus(
            UUID ticketId,
            UpdateTicketStatusRequest request
    ) {

        UserEntity currentUser = getCurrentUser();

        if (!(currentUser.getRole() == UserRole.ADMIN ||
                currentUser.getRole() == UserRole.SUPPORT_AGENT)) {

            throw new AccessDeniedException(
                    "Only admins or support agents can change ticket status"
            );
        }

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        validateStatusTransition(
                ticket.getStatus(),
                request.status()
        );

        ticket.setStatus(request.status());

        if (request.status() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(Instant.now());
        }

        TicketEntity saved = ticketRepository.save(ticket);

        return toResponse(saved);
    }

        @Transactional(readOnly = true)
public Page<TicketResponse> searchTickets(
        TicketStatus status,
        TicketPriority priority,
        boolean mine,
        Pageable pageable
) {

    UserEntity currentUser = getCurrentUser();

    Page<TicketEntity> page;

    // If user wants ONLY their tickets
    if (mine) {

        if (currentUser.getRole() == UserRole.SUPPORT_AGENT) {
            page = ticketRepository
                    .findByAssigneeAndDeletedFalse(currentUser, pageable);

        } else {
            page = ticketRepository
                    .findByOwnerAndDeletedFalse(currentUser, pageable);
        }

    } else if (status != null) {

        page = ticketRepository
                .findByStatusAndDeletedFalse(status, pageable);

    } else if (priority != null) {

        page = ticketRepository
                .findByPriorityAndDeletedFalse(priority, pageable);

    } else {

        page = ticketRepository
                .findByDeletedFalse(pageable);
    }

    return page.map(this::toResponse);
}
    // -------------------------
// SOFT DELETE
// -------------------------
@Transactional
public void softDeleteTicket(UUID id) {

    UserEntity currentUser = getCurrentUser();

    TicketEntity ticket = ticketRepository
            .findByIdAndDeletedFalse(id)
            .orElseThrow(() ->
                    new RuntimeException("Ticket not found"));

    boolean isOwner =
            ticket.getOwner().getId().equals(currentUser.getId());

    boolean isAdmin =
            currentUser.getRole() == UserRole.ADMIN;

    if (!isAdmin) {

        if (!isOwner) {
            throw new AccessDeniedException(
                    "You cannot delete this ticket"
            );
        }

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new RuntimeException(
                    "Only OPEN tickets can be deleted"
            );
        }
    }

    ticket.setDeleted(true);

    ticketRepository.save(ticket);
}


// -------------------------
// RESTORE
// -------------------------
@Transactional
public void restoreTicket(UUID id) {

    UserEntity currentUser = getCurrentUser();

    if (currentUser.getRole() != UserRole.ADMIN) {
        throw new AccessDeniedException(
                "Only admins can restore tickets"
        );
    }

    TicketEntity ticket = ticketRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Ticket not found"));

    if (!ticket.isDeleted()) {
        return;
    }

    ticket.setDeleted(false);

    ticketRepository.save(ticket);
}




    // -------------------------
    // HELPERS
    // -------------------------
    private UserEntity getCurrentUser() {

        String email = SecurityUtils.getCurrentUsername();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }
    // -------------------------
// RATE TICKET (OWNER ONLY)
// -------------------------
@Transactional
public TicketResponse rateTicket(
        UUID ticketId,
        RateTicketRequest request
) {

    UserEntity currentUser = getCurrentUser();

    TicketEntity ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    // Only owner can rate
    if (!ticket.getOwner().getId().equals(currentUser.getId())) {
        throw new AccessDeniedException(
                "Only ticket owner can rate the ticket"
        );
    }

    // Must be resolved
    if (ticket.getStatus() != TicketStatus.RESOLVED) {
        throw new RuntimeException(
                "Ticket must be RESOLVED before rating"
        );
    }

    // Prevent double rating
    if (ticket.getRating() != null) {
        throw new RuntimeException(
                "Ticket already rated"
        );
    }

    // Extra safety — bounds check (even though DTO validates)
    if (request.rating() < 1 || request.rating() > 5) {
        throw new RuntimeException(
                "Rating must be between 1 and 5"
        );
    }

    ticket.setRating(request.rating());
    ticket.setRatingComment(request.comment());
    ticket.setStatus(TicketStatus.CLOSED);

    TicketEntity saved = ticketRepository.save(ticket);

    return toResponse(saved);
}



    private void validateStatusTransition(
            TicketStatus current,
            TicketStatus next
    ) {

        if (current == TicketStatus.CLOSED) {
            throw new RuntimeException(
                    "Closed tickets cannot be modified"
            );
        }

        if (current == next) {
            return;
        }

        switch (current) {
            case OPEN -> {
                if (next != TicketStatus.IN_PROGRESS &&
                        next != TicketStatus.CLOSED) {
                    throw new RuntimeException(
                            "OPEN can go only to IN_PROGRESS or CLOSED"
                    );
                }
            }
            case IN_PROGRESS -> {
                if (next != TicketStatus.RESOLVED &&
                        next != TicketStatus.CLOSED) {
                    throw new RuntimeException(
                            "IN_PROGRESS can go only to RESOLVED or CLOSED"
                    );
                }
            }
            case RESOLVED -> {
                if (next != TicketStatus.CLOSED) {
                    throw new RuntimeException(
                            "RESOLVED can go only to CLOSED"
                    );
                }
            }
        }
    }

    private TicketResponse toResponse(TicketEntity ticket) {

        UserSummaryDto owner = new UserSummaryDto(
                ticket.getOwner().getId(),
                ticket.getOwner().getEmail(),
                ticket.getOwner().getFirstName(),
                ticket.getOwner().getLastName()
        );

        UserSummaryDto assignee = null;

        if (ticket.getAssignee() != null) {
            assignee = new UserSummaryDto(
                    ticket.getAssignee().getId(),
                    ticket.getAssignee().getEmail(),
                    ticket.getAssignee().getFirstName(),
                    ticket.getAssignee().getLastName()
            );
        }

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                owner,
                assignee,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt(),
                ticket.getRating(),
                ticket.getRatingComment()
        );
    }
}
