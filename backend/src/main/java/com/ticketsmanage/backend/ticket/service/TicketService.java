package com.ticketsmanage.backend.ticket.service;

import com.ticketsmanage.backend.notification.event.TicketAssignedEvent;
import com.ticketsmanage.backend.notification.event.TicketCreatedEvent;
import com.ticketsmanage.backend.notification.event.TicketStatusChangedEvent;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

        private final TicketRepository ticketRepository;
        private final UserRepository userRepository;
        private final TicketActivityService ticketActivityService;
        private final ApplicationEventPublisher eventPublisher;

        @Transactional
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

                eventPublisher.publishEvent(new TicketCreatedEvent(saved.getId()));

                return toResponse(saved);
        }

        @Transactional(readOnly = true)
        public Page<TicketResponse> getMyTickets(String search, Pageable pageable) {

                UserEntity currentUser = getCurrentUser();

                org.springframework.data.jpa.domain.Specification<TicketEntity> spec = com.ticketsmanage.backend.ticket.repository.TicketSpecification
                                .withFilters(
                                                null, null, currentUser, null, search, false);

                return ticketRepository.findAll(spec, pageable).map(this::toResponse);
        }

        @Transactional(readOnly = true)
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

        @Transactional(readOnly = true)
        public Page<TicketResponse> searchTickets(
                        TicketStatus status,
                        TicketPriority priority,
                        boolean mine,
                        boolean assigned,
                        String search,
                        Pageable pageable) {
                UserEntity currentUser = getCurrentUser();
                UserEntity owner = mine ? currentUser : null;
                UserEntity assignee = assigned ? currentUser : null;

                if (!mine && !assigned) {
                        if (currentUser.getRole() == UserRole.USER) {
                                owner = currentUser;
                        } else if (currentUser.getRole() == UserRole.SUPPORT_AGENT) {
                                assignee = currentUser;
                        }
                }

                org.springframework.data.jpa.domain.Specification<TicketEntity> spec = com.ticketsmanage.backend.ticket.repository.TicketSpecification
                                .withFilters(
                                                status, priority, owner, assignee, search, false);

                return ticketRepository.findAll(spec, pageable).map(this::toResponse);
        }

        @Transactional(readOnly = true)
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

        @Transactional
        public TicketResponse updateStatus(
                        UUID ticketId,
                        UpdateTicketStatusRequest request) {

                UserEntity currentUser = getCurrentUser();

                TicketEntity ticket = ticketRepository.findByIdAndDeletedFalse(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                boolean isOwner = ticket.getOwner().getId().equals(currentUser.getId());
                boolean isAssignee = ticket.getAssignee() != null && 
                                ticket.getAssignee().getId().equals(currentUser.getId());
                boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
                
                if (!isOwner && !isAssignee && !isAdmin) {
                        throw new AccessDeniedException("Only admin, assigned agent, or ticket owner can update status");
                }

                if (isOwner && !isAdmin && !isAssignee) {
                        validateOwnerStatusTransition(ticket.getStatus(), request.status());
                } else {
                        validateStatusTransition(ticket.getStatus(), request.status());
                }

                ticket.setStatus(request.status());

                if (request.status() == TicketStatus.RESOLVED) {
                        ticket.setResolvedAt(Instant.now());
                }

                ticketRepository.save(ticket);

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "STATUS_CHANGED",
                                "Changed to " + request.status());

                eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticket.getId(),
                                request.status().toString(),
                                ticket.getTitle(),
                                ticket.getOwner().getEmail(),
                                ticket.getPriority().toString()
                ));

                return toResponse(ticket);
        }

        @Transactional
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
                ticketRepository.save(ticket);

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "ASSIGNED",
                                "Assigned to " + assignee.getEmail());

                eventPublisher.publishEvent(new TicketAssignedEvent(ticket.getId(), assignee.getId()));

                return toResponse(ticket);
        }

        @Transactional
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

        @Transactional
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
                        log.error("Dashboard error", e);
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                                        "Dashboard Error: " + e.toString());
                }
        }

        private UserEntity getCurrentUser() {

                String email = SecurityUtils.getCurrentUsername();

                return userRepository
                                .findByEmail(email)
                                .orElseThrow();
        }

        private void validateOwnerStatusTransition(
                        TicketStatus current,
                        TicketStatus next) {

                if (current == next)
                        return;

                if (current == TicketStatus.RESOLVED && next == TicketStatus.OPEN) {
                        return;
                }

                throw new RuntimeException("Invalid status transition for ticket owner");
        }

        private void validateStatusTransition(
                        TicketStatus current,
                        TicketStatus next) {

                if (current == next)
                        return;
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

                ticketActivityService.log(
                                ticket,
                                currentUser,
                                "RATED",
                                "Rating: " + request.rating());

                return toResponse(ticket);
        }

}
