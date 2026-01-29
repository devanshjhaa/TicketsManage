package com.ticketsmanage.backend.notification.listener;

import com.ticketsmanage.backend.notification.event.*;
import com.ticketsmanage.backend.notification.service.ResendEmailService;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketNotificationListener {

    private final ResendEmailService emailService;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // CREATED
    @Async
    @EventListener
    public void onTicketCreated(TicketCreatedEvent event) {

        TicketEntity ticket =
                ticketRepository.findById(event.ticketId())
                        .orElseThrow();

        emailService.send(
                ticket.getOwner().getEmail(),
                "Ticket Created: " + ticket.getTitle(),
                "Your ticket has been created."
        );
    }

    // ASSIGNED
    @Async
    @EventListener
    public void onTicketAssigned(TicketAssignedEvent event) {

        TicketEntity ticket =
                ticketRepository.findById(event.ticketId())
                        .orElseThrow();

        UserEntity assignee =
                userRepository.findById(event.assigneeId())
                        .orElseThrow();

        emailService.send(
                assignee.getEmail(),
                "Ticket Assigned: " + ticket.getTitle(),
                "You have been assigned a ticket."
        );
    }

    // STATUS
    @Async
    @EventListener
    public void onStatusChanged(TicketStatusChangedEvent event) {

        TicketEntity ticket =
                ticketRepository.findById(event.ticketId())
                        .orElseThrow();

        emailService.send(
                ticket.getOwner().getEmail(),
                "Ticket Status Updated: " + ticket.getTitle(),
                "Status is now: " + ticket.getStatus()
        );
    }

    // COMMENT
    @Async
    @EventListener
    public void onComment(CommentAddedEvent event) {

        TicketEntity ticket =
                ticketRepository.findById(event.ticketId())
                        .orElseThrow();

        emailService.send(
                ticket.getOwner().getEmail(),
                "New Comment on Ticket",
                "A new comment was added to your ticket."
        );
    }

    // ATTACHMENT
    @Async
    @EventListener
    public void onAttachment(AttachmentUploadedEvent event) {

        TicketEntity ticket =
                ticketRepository.findById(event.ticketId())
                        .orElseThrow();

        emailService.send(
                ticket.getOwner().getEmail(),
                "Attachment Uploaded",
                "A new attachment was uploaded to your ticket."
        );
    }
}
