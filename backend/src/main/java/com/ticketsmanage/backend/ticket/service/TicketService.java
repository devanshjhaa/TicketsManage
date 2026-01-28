package com.ticketsmanage.backend.ticket.service;

import com.ticketsmanage.backend.ticket.dto.CreateTicketRequest;
import com.ticketsmanage.backend.ticket.dto.TicketResponse;
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
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketResponse createTicket(CreateTicketRequest request) {

        UserEntity owner = userRepository.findById(request.ownerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        TicketEntity ticket = new TicketEntity();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setOwner(owner);

        TicketEntity saved = ticketRepository.save(ticket);

        return toResponse(saved);
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TicketResponse getTicketById(UUID id) {
        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return toResponse(ticket);
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
