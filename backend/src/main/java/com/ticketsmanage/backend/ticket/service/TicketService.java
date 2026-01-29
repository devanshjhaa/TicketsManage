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
import java.util.*;

@Service
@RequiredArgsConstructor
public class TicketService {

        private final TicketRepository ticketRepository;
        private final UserRepository userRepository;
        private final TicketActivityService ticketActivityService;

        // CREATE
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
                                "Ticket created");

                return toResponse(saved);
        }

        // GET MY
        // GET MY
        public Page<TicketResponse> getMyTickets(String search, Pageable pageable) {

                UserEntity currentUser = getCurrentUser();

                org.springframework.data.jpa.domain.Specification<TicketEntity> spec = com.ticketsmanage.backend.ticket.repository.TicketSpecification
                                .withFilters(
                                                null, null, currentUser, null, search, false);

                return ticketRepository.findAll(spec, pageable).map(this::toResponse);
        }

        // GET ALL
        // GET ALL
        public Page<TicketResponse> getAllTickets(Pageable pageable) {

                UserEntity currentUser = getCurrentUser();
                org.springframework.data.jpa.domain.Specification<TicketEntity> spec;

                if (currentUser.getRole() == UserRole.ADMIN) {
                        spec = com.ticketsmanage.backend.ticket.repository.TicketSpecification.withFilters(
                                        null, null, null, null, null, false);
                } else if (currentUser.getRole() == UserRole.SUPPORT_AGENT) {
                        spec = com.ticketsmanage.backend.ticket.repository.TicketSpecification.withFilters(
                                        null, null, null, currentUser, null, false);
                } else {
                        spec = com.ticketsmanage.backend.ticket.repository.TicketSpecification.withFilters(
                                        null, null, currentUser, null, null, false);
                }

                return ticketRepository.findAll(spec, pageable).map(this::toResponse);
        }

        // SEARCH
        // SEARCH
        public Page<TicketResponse> searchTickets(
                        TicketStatus status,
                        TicketPriority priority,
                        boolean mine,
                        String search,
                        Pageable pageable) {
                UserEntity currentUser = getCurrentUser();
                UserEntity owner = mine ? currentUser : null;

                // If not mine & not admin/support, enforce owner=current
                if (!mine && currentUser.getRole() == UserRole.USER) {
                        owner = currentUser;
                }

                org.springframework.data.jpa.domain.Specification<TicketEntity> spec = com.ticketsmanage.backend.ticket.repository.TicketSpecification
                                .withFilters(
                                                status, priority, owner, null, search, false);

                return ticketRepository.findAll(spec, pageable).map(this::toResponse);
        }

        // GET BY ID
        public TicketResponse getTicketById(UUID id) {

                UserEntity currentUser = getCurrentUser();

                TicketEntity ticket = ticketRepository.findByIdAndDeletedFalse(id)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                boolean allowed = ticket.getOwner().getId().equals(currentUser.getId())
                                || (ticket.getAssignee() != null &&
                                                ticket.getAssignee().getId().equals(currentUser.getId()))
                                || currentUser.getRole() == UserRole.ADMIN;

                if (!allowed) {
                        throw new AccessDeniedException("Forbidden");
                }

                return toResponse(ticket);
        }

        // STATUS
        public TicketResponse updateStatus(
                        UUID ticketId,
                        UpdateTicketStatusRequest request) {

                UserEntity currentUser = getCurrentUser();

                TicketEntity ticket = ticketRepository.findByIdAndDeletedFalse(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                validateStatusTransition(ticket.getStatus(), request.status());

                ticket.setStatus(request.status());

                if (request.status() == TicketStatus.RESOLVED) {
                        ticket.setResolvedAt(Instant.now());
                }

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "STATUS_CHANGED",
                                "Changed to " + request.status());

                return toResponse(ticket);
        }

        // ASSIGN
        public TicketResponse assignTicket(
                        UUID ticketId,
                        AssignTicketRequest request) {

                UserEntity currentUser = getCurrentUser();

                if (!(currentUser.getRole() == UserRole.ADMIN ||
                                currentUser.getRole() == UserRole.SUPPORT_AGENT)) {

                        throw new AccessDeniedException("Forbidden");
                }

                TicketEntity ticket = ticketRepository.findByIdAndDeletedFalse(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                UserEntity assignee = userRepository.findById(request.assigneeId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ticket.setAssignee(assignee);

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "ASSIGNED",
                                "Assigned to " + assignee.getEmail());

                return toResponse(ticket);
        }

        // SOFT DELETE
        public void softDeleteTicket(UUID id) {

                UserEntity currentUser = getCurrentUser();

                TicketEntity ticket = ticketRepository.findByIdAndDeletedFalse(id)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                ticket.setDeleted(true);

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "SOFT_DELETED",
                                "Ticket deleted");
        }

        // RESTORE
        public void restoreTicket(UUID id) {

                UserEntity currentUser = getCurrentUser();

                TicketEntity ticket = ticketRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                ticket.setDeleted(false);

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "RESTORED",
                                "Ticket restored");
        }

        @Transactional(readOnly = true)
        public AdminDashboardResponse getAdminDashboard() {
                try {
                        UserEntity currentUser = getCurrentUser();

                        if (currentUser.getRole() != UserRole.ADMIN) {
                                throw new AccessDeniedException("Admins only");
                        }

                        Map<String, Long> statusCounts = new HashMap<>();
                        for (TicketStatus s : TicketStatus.values()) {
                                statusCounts.put(
                                                s.name(),
                                                ticketRepository.countByStatusAndDeletedFalse(s));
                        }

                        Map<String, Long> priorityCounts = new HashMap<>();
                        for (TicketPriority p : TicketPriority.values()) {
                                priorityCounts.put(
                                                p.name(),
                                                ticketRepository.countByPriorityAndDeletedFalse(p));
                        }

                        return new AdminDashboardResponse(
                                        ticketRepository.countByDeletedFalse(),
                                        ticketRepository.countByDeletedTrue(),
                                        statusCounts,
                                        priorityCounts,
                                        null,
                                        Map.of());
                } catch (Exception e) {
                        e.printStackTrace(); // Log key info
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                                        "Dashboard Error: " + e.toString());
                }
        }

        // HELPERS
        private UserEntity getCurrentUser() {

                String email = SecurityUtils.getCurrentUsername();

                return userRepository
                                .findByEmail(email)
                                .orElseThrow();
        }

        private void validateStatusTransition(
                        TicketStatus current,
                        TicketStatus next) {

                if (current == TicketStatus.CLOSED) {
                        throw new RuntimeException("Closed tickets immutable");
                }

                if (current == next)
                        return;

                switch (current) {
                        case OPEN -> {
                                if (next != TicketStatus.IN_PROGRESS &&
                                                next != TicketStatus.CLOSED)
                                        throw new RuntimeException();
                        }
                        case IN_PROGRESS -> {
                                if (next != TicketStatus.RESOLVED &&
                                                next != TicketStatus.CLOSED)
                                        throw new RuntimeException();
                        }
                        case RESOLVED -> {
                                if (next != TicketStatus.CLOSED)
                                        throw new RuntimeException();
                        }
                }
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

        @Transactional
        public TicketResponse rateTicket(
                        UUID ticketId,
                        RateTicketRequest request) {

                UserEntity currentUser = getCurrentUser();

                TicketEntity ticket = ticketRepository.findByIdAndDeletedFalse(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                // only owner can rate
                if (!ticket.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException(
                                        "Only ticket owner can rate");
                }

                if (ticket.getStatus() != TicketStatus.RESOLVED) {
                        throw new RuntimeException(
                                        "Ticket must be RESOLVED before rating");
                }

                if (ticket.getRating() != null) {
                        throw new RuntimeException(
                                        "Ticket already rated");
                }

                ticket.setRating(request.rating());
                ticket.setRatingComment(request.comment());
                ticket.setStatus(TicketStatus.CLOSED);

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "RATED",
                                "Rating: " + request.rating());

                return toResponse(ticket);
        }

}
