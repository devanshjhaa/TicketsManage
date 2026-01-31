package com.ticketsmanage.backend.ticket.controller;

import com.ticketsmanage.backend.ticket.dto.*;
import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/my")
    public Page<TicketResponse> getMyTickets(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ticketService.getMyTickets(q, pageable);
    }

    @PostMapping
    public TicketResponse createTicket(
            @RequestBody @Valid CreateTicketRequest request) {
        return ticketService.createTicket(request);
    }

    @GetMapping
    public Page<TicketResponse> getAllTickets(Pageable pageable) {
        return ticketService.getAllTickets(pageable);
    }

    @GetMapping("/search")
    public Page<TicketResponse> searchTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Boolean mine,
            @RequestParam(required = false) Boolean assigned,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ticketService.searchTickets(
                status,
                priority,
                mine != null && mine,
                assigned != null && assigned,
                search,
                pageable);
    }

    @GetMapping("/{id}")
    public TicketResponse getTicketById(
            @PathVariable UUID id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}/status")
    public TicketResponse updateStatus(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateTicketStatusRequest request) {
        return ticketService.updateStatus(id, request);
    }

    @PostMapping("/{id}/assign")
    public TicketResponse assignTicket(
            @PathVariable UUID id,
            @RequestBody @Valid AssignTicketRequest request) {
        return ticketService.assignTicket(id, request);
    }

    @PostMapping("/{id}/rating")
    public TicketResponse rateTicket(
            @PathVariable UUID id,
            @RequestBody @Valid RateTicketRequest request) {
        return ticketService.rateTicket(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTicket(
            @PathVariable UUID id) {
        ticketService.softDeleteTicket(id);
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public void restoreTicket(
            @PathVariable UUID id) {
        ticketService.restoreTicket(id);
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminDashboardResponse getDashboard() {
        return ticketService.getAdminDashboard();
    }

}
