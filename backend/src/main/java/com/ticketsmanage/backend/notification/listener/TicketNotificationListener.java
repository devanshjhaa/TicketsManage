package com.ticketsmanage.backend.notification.listener;

import com.ticketsmanage.backend.notification.event.*;
import com.ticketsmanage.backend.notification.service.ResendEmailService;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TicketNotificationListener {

    private final ResendEmailService emailService;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // CREATED
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onTicketCreated(TicketCreatedEvent event) {
        try {
            TicketEntity ticket =
                    ticketRepository.findById(event.ticketId())
                            .orElseThrow();

            emailService.send(
                    ticket.getOwner().getEmail(),
                    "Ticket Created: " + ticket.getTitle(),
                    "Your ticket has been created."
            );
        } catch (Exception e) {
            log.warn("Failed to send ticket created notification: {}", e.getMessage());
        }
    }

    // ASSIGNED
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onTicketAssigned(TicketAssignedEvent event) {
        try {
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
        } catch (Exception e) {
            log.warn("Failed to send ticket assigned notification: {}", e.getMessage());
        }
    }

    // STATUS
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onStatusChanged(TicketStatusChangedEvent event) {
        try {
            TicketEntity ticket =
                    ticketRepository.findById(event.ticketId())
                            .orElseThrow();

            emailService.send(
                    ticket.getOwner().getEmail(),
                    "Ticket Status Updated: " + ticket.getTitle(),
                    "Status is now: " + ticket.getStatus()
            );
        } catch (Exception e) {
            log.warn("Failed to send status changed notification: {}", e.getMessage());
        }
    }

    // COMMENT
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onComment(CommentAddedEvent event) {
        try {
            TicketEntity ticket =
                    ticketRepository.findById(event.ticketId())
                            .orElseThrow();

            emailService.send(
                    ticket.getOwner().getEmail(),
                    "New Comment on Ticket",
                    "A new comment was added to your ticket."
            );
        } catch (Exception e) {
            log.warn("Failed to send comment notification: {}", e.getMessage());
        }
    }

    // ATTACHMENT
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onAttachment(AttachmentUploadedEvent event) {
        try {
            TicketEntity ticket =
                    ticketRepository.findById(event.ticketId())
                            .orElseThrow();

            emailService.send(
                    ticket.getOwner().getEmail(),
                    "Attachment Uploaded",
                    "A new attachment was uploaded to your ticket."
            );
        } catch (Exception e) {
            log.warn("Failed to send attachment notification: {}", e.getMessage());
        }
    }
}
