package com.ticketsmanage.backend.ticketactivity.controller;

import com.ticketsmanage.backend.ticketactivity.dto.TicketActivityResponse;
import com.ticketsmanage.backend.ticketactivity.service.TicketActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets/{ticketId}/activities")
@RequiredArgsConstructor
public class TicketActivityController {

    private final TicketActivityService activityService;

    @GetMapping
    public List<TicketActivityResponse> getTimeline(
            @PathVariable UUID ticketId
    ) {
        return activityService.getTimeline(ticketId);
    }
}
