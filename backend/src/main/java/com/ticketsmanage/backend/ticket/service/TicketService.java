package com.ticketsmanage.backend.ticket.service;

import com.ticketsmanage.backend.security.util.SecurityUtils;
import com.ticketsmanage.backend.ticket.dto.*;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.ticketactivity.service.TicketActivityService;
import com.ticketsmanage.backend.user.dto.UserSummaryDto;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketActivityService ticketActivityService;

    // -------------------------
    // CREATE
    // -------------------------
    public TicketResponse createTicket(CreateTicketRequest request) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = new TicketEntity();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setOwner(currentUser);

        TicketEntity saved = ticketRepository.save(ticket);

        ticketActivityService.log(
                saved,
                currentUser,
                "CREATED",
                "Ticket created"
        );

        return toResponse(saved);
    }

    // -------------------------
    // GET MY
    // -------------------------
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets() {

        UserEntity currentUser = getCurrentUser();

        return ticketRepository.findAll()
                .stream()
                .filter(t -> !t.isDeleted())
                .filter(t ->
                        t.getOwner()
                                .getId()
                                .equals(currentUser.getId()))
                .map(this::toResponse)
                .toList();
    }

    // -------------------------
    // GET ALL
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
                .filter(t -> !t.isDeleted())
                .map(this::toResponse)
                .toList();
    }

    // -------------------------
    // SEARCH
    // -------------------------
    @Transactional(readOnly = true)
    public Page<TicketResponse> searchTickets(
            TicketStatus status,
            TicketPriority priority,
            boolean mine,
            Pageable pageable
    ) {

        UserEntity currentUser = getCurrentUser();

        Page<TicketEntity> tickets;

        if (mine) {

            if (status != null && priority != null) {
                tickets = ticketRepository
                        .findByOwnerAndStatusAndPriorityAndDeletedFalse(
                                currentUser, status, priority, pageable);

            } else if (status != null) {
                tickets = ticketRepository
                        .findByOwnerAndStatusAndDeletedFalse(
                                currentUser, status, pageable);

            } else if (priority != null) {
                tickets = ticketRepository
                        .findByOwnerAndPriorityAndDeletedFalse(
                                currentUser, priority, pageable);

            } else {
                tickets = ticketRepository
                        .findByOwnerAndDeletedFalse(
                                currentUser, pageable);
            }

        } else {

            if (status != null && priority != null) {
                tickets = ticketRepository
                        .findByStatusAndPriorityAndDeletedFalse(
                                status, priority, pageable);

            } else if (status != null) {
                tickets = ticketRepository
                        .findByStatusAndDeletedFalse(
                                status, pageable);

            } else if (priority != null) {
                tickets = ticketRepository
                        .findByPriorityAndDeletedFalse(
                                priority, pageable);

            } else {
                tickets = ticketRepository
                        .findByDeletedFalse(pageable);
            }
        }

        return tickets.map(this::toResponse);
    }

    // -------------------------
    // GET BY ID
    // -------------------------
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(UUID id) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        if (ticket.isDeleted()) {
            throw new RuntimeException("Ticket not found");
        }

        boolean isOwner =
                ticket.getOwner()
                        .getId()
                        .equals(currentUser.getId());

        boolean isAssignee =
                ticket.getAssignee() != null &&
                        ticket.getAssignee()
                                .getId()
                                .equals(currentUser.getId());

        boolean isAdmin =
                currentUser.getRole() == UserRole.ADMIN;

        if (!(isOwner || isAssignee || isAdmin)) {
            throw new AccessDeniedException(
                    "You are not allowed to view this ticket");
        }

        return toResponse(ticket);
    }

    // -------------------------
    // ASSIGN
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
                    "Only admins or support agents can assign tickets");
        }

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        UserEntity assignee = userRepository.findById(
                request.assigneeId())
                .orElseThrow(() ->
                        new RuntimeException("Assignee not found"));

        ticket.setAssignee(assignee);

        TicketEntity saved = ticketRepository.save(ticket);

        ticketActivityService.log(
                saved,
                currentUser,
                "ASSIGNED",
                "Assigned to " + assignee.getEmail());

        return toResponse(saved);
    }

    // -------------------------
    // STATUS
    // -------------------------
    @Transactional
    public TicketResponse updateStatus(
            UUID ticketId,
            UpdateTicketStatusRequest request
    ) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        validateStatusTransition(
                ticket.getStatus(),
                request.status());

        ticket.setStatus(request.status());

        if (request.status() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(Instant.now());
        }

        TicketEntity saved = ticketRepository.save(ticket);

        ticketActivityService.log(
                saved,
                currentUser,
                "STATUS_CHANGED",
                "Changed to " + request.status());

        return toResponse(saved);
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

        ticket.setDeleted(true);

        ticketActivityService.log(
                ticket,
                currentUser,
                "SOFT_DELETED",
                "Ticket marked deleted");
    }

    // -------------------------
    // RESTORE
    // -------------------------
    @Transactional
    public void restoreTicket(UUID id) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        ticket.setDeleted(false);

        ticketActivityService.log(
                ticket,
                currentUser,
                "RESTORED",
                "Ticket restored");
    }

    // -------------------------
    // RATE
    // -------------------------
    @Transactional
    public TicketResponse rateTicket(
            UUID ticketId,
            RateTicketRequest request
    ) {

        UserEntity currentUser = getCurrentUser();

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new RuntimeException(
                    "Ticket must be RESOLVED before rating");
        }

        ticket.setRating(request.rating());
        ticket.setRatingComment(request.comment());
        ticket.setStatus(TicketStatus.CLOSED);

        TicketEntity saved = ticketRepository.save(ticket);

        ticketActivityService.log(
                saved,
                currentUser,
                "RATED",
                "Rating: " + request.rating());

        return toResponse(saved);
    }

    // -------------------------
    // HELPERS
    // -------------------------
    private UserEntity getCurrentUser() {

        String email = SecurityUtils.getCurrentUsername();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));
    }

    private void validateStatusTransition(
            TicketStatus current,
            TicketStatus next
    ) {

        if (current == TicketStatus.CLOSED) {
            throw new RuntimeException(
                    "Closed tickets cannot be modified");
        }

        if (current == next) return;

        switch (current) {
            case OPEN -> {
                if (next != TicketStatus.IN_PROGRESS &&
                        next != TicketStatus.CLOSED)
                    throw new RuntimeException(
                            "OPEN → IN_PROGRESS/CLOSED only");
            }
            case IN_PROGRESS -> {
                if (next != TicketStatus.RESOLVED &&
                        next != TicketStatus.CLOSED)
                    throw new RuntimeException(
                            "IN_PROGRESS → RESOLVED/CLOSED only");
            }
            case RESOLVED -> {
                if (next != TicketStatus.CLOSED)
                    throw new RuntimeException(
                            "RESOLVED → CLOSED only");
            }
        }
    }
        // -------------------------
// ADMIN DASHBOARD
// -------------------------
@Transactional(readOnly = true)
public AdminDashboardResponse getAdminDashboard() {

    UserEntity currentUser = getCurrentUser();

    if (currentUser.getRole() != UserRole.ADMIN) {
        throw new AccessDeniedException("Admins only");
    }

    Map<String, Long> statusCounts = new HashMap<>();
    for (TicketStatus s : TicketStatus.values()) {
        statusCounts.put(
                s.name(),
                ticketRepository.countByStatusAndDeletedFalse(s)
        );
    }

    Map<String, Long> priorityCounts = new HashMap<>();
    for (TicketPriority p : TicketPriority.values()) {
        priorityCounts.put(
                p.name(),
                ticketRepository.countByPriorityAndDeletedFalse(p)
        );
    }

    Map<String, Long> perAgent = new HashMap<>();
    for (Object[] row : ticketRepository.countTicketsPerAgent()) {
        perAgent.put(
                row[0].toString(),
                (Long) row[1]
        );
    }

    return new AdminDashboardResponse(

            ticketRepository.countByDeletedFalse(),
            ticketRepository.countByDeletedTrue(),

            statusCounts,
            priorityCounts,

            ticketRepository.averageResolutionSeconds(),

            perAgent
    );
}


    private TicketResponse toResponse(TicketEntity ticket) {

        UserSummaryDto owner = new UserSummaryDto(
                ticket.getOwner().getId(),
                ticket.getOwner().getEmail(),
                ticket.getOwner().getFirstName(),
                ticket.getOwner().getLastName());

        UserSummaryDto assignee = null;

        if (ticket.getAssignee() != null) {
            assignee = new UserSummaryDto(
                    ticket.getAssignee().getId(),
                    ticket.getAssignee().getEmail(),
                    ticket.getAssignee().getFirstName(),
                    ticket.getAssignee().getLastName());
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
                ticket.getRatingComment());
    }
}
