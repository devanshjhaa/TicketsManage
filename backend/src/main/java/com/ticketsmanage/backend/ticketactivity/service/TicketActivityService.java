package com.ticketsmanage.backend.ticketactivity.service;

import com.ticketsmanage.backend.security.util.SecurityUtils;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.ticketactivity.dto.TicketActivityResponse;
import com.ticketsmanage.backend.ticketactivity.entity.TicketActivityEntity;
import com.ticketsmanage.backend.ticketactivity.repository.TicketActivityRepository;
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
public class TicketActivityService {

    private final TicketActivityRepository activityRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // -------------------------
    // LOG ACTIVITY
    // -------------------------
    @Transactional
    public void log(
            TicketEntity ticket,
            UserEntity actor,
            String action,
            String details
    ) {

        TicketActivityEntity activity = new TicketActivityEntity();

        activity.setTicket(ticket);
        activity.setActor(actor);
        activity.setAction(action);
        activity.setDetails(details);

        activityRepository.save(activity);
    }

    // -------------------------
    // GET TIMELINE
    // -------------------------
    @Transactional(readOnly = true)
    public List<TicketActivityResponse> getTimeline(
            UUID ticketId
    ) {

        UserEntity user = getCurrentUser();

        TicketEntity ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found"));

        boolean allowed =
                user.getRole() == UserRole.ADMIN
                        || ticket.getOwner().getId().equals(user.getId())
                        || (ticket.getAssignee() != null
                        && ticket.getAssignee().getId().equals(user.getId()));

        if (!allowed) {
            throw new AccessDeniedException(
                    "Not allowed to view ticket history"
            );
        }

        return activityRepository
                .findByTicketOrderByCreatedAtAsc(ticket)
                .stream()
                .map(a -> new TicketActivityResponse(
                        a.getId(),
                        a.getAction(),
                        a.getDetails(),
                        a.getActor().getEmail(),
                        a.getCreatedAt()
                ))
                .toList();
    }

    // -------------------------
    // HELPERS
    // -------------------------
    private UserEntity getCurrentUser() {

        return userRepository
                .findByEmail(SecurityUtils.getCurrentUsername())
                .orElseThrow(() ->
                        new RuntimeException("Authenticated user not found"));
    }
}
