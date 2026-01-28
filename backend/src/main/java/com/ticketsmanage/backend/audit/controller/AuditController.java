package com.ticketsmanage.backend.audit.controller;

import com.ticketsmanage.backend.audit.dto.AuditLogResponse;
import com.ticketsmanage.backend.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/ticket/{ticketId}")
    public List<AuditLogResponse> getLogsForTicket(@PathVariable UUID ticketId) {
        return auditService.getLogsForTicket(ticketId);
    }
}
