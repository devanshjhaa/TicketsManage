package com.ticketsmanage.backend.ticket.controller;

import com.ticketsmanage.backend.notification.service.ResendEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-email")
@RequiredArgsConstructor
public class TestEmailController {

    private final ResendEmailService emailService;

    @GetMapping
    public String sendTestEmail(
            @RequestParam String to
    ) {

        emailService.send(
                to,
                "TicketsManage Test Email",
                "<h2>Email system works </h2><p>This is a test.</p>"
        );

        return "Email sent to " + to;
    }
}
