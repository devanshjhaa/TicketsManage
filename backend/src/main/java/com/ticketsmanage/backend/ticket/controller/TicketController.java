package com.ticketsmanage.backend.ticket.controller;

import com.ticketsmanage.backend.ticket.dto.CreateTicketRequest;
import com.ticketsmanage.backend.ticket.dto.TicketResponse;
import com.ticketsmanage.backend.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // Create ticket
    @PostMapping
    public TicketResponse createTicket(
            @RequestBody @Valid CreateTicketRequest request
    ) {
        return ticketService.createTicket(request);
    }

    // Get all tickets
    @GetMapping
    public List<TicketResponse> getAllTickets() {
        return ticketService.getAllTickets();
    }

    // Get ticket by id
    @GetMapping("/{id}")
    public TicketResponse getTicketById(@PathVariable UUID id) {
        return ticketService.getTicketById(id);
    }
}
