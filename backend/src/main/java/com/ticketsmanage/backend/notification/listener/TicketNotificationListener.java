package com.ticketsmanage.backend.notification.listener;

import com.ticketsmanage.backend.notification.event.*;
import com.ticketsmanage.backend.notification.service.ResendEmailService;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.frontend-url:https://ticketsmanage.dev}")
    private String frontendUrl;

    // CREATED - Notify ticket owner
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onTicketCreated(TicketCreatedEvent event) {
        try {
            TicketEntity ticket = ticketRepository.findById(event.ticketId()).orElse(null);
            if (ticket == null) {
                log.warn("Ticket not found for created event: {}", event.ticketId());
                return;
            }

            String ticketUrl = frontendUrl + "/dashboard/tickets/" + ticket.getId();
            String html = buildEmailTemplate(
                "Ticket Created Successfully",
                "Your support ticket has been created and our team will review it shortly.",
                ticket.getTitle(),
                ticket.getId().toString().substring(0, 8),
                ticket.getStatus().toString(),
                ticket.getPriority().toString(),
                ticketUrl
            );

            emailService.send(
                ticket.getOwner().getEmail(),
                "✅ Ticket Created: " + ticket.getTitle(),
                html
            );
        } catch (Exception e) {
            log.warn("Failed to send ticket created notification: {}", e.getMessage());
        }
    }

    // ASSIGNED - Notify the assigned agent
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onTicketAssigned(TicketAssignedEvent event) {
        try {
            TicketEntity ticket = ticketRepository.findById(event.ticketId()).orElse(null);
            UserEntity assignee = userRepository.findById(event.assigneeId()).orElse(null);
            
            if (ticket == null || assignee == null) {
                log.warn("Ticket or assignee not found for assigned event");
                return;
            }

            String ticketUrl = frontendUrl + "/dashboard/tickets/" + ticket.getId();
            String html = buildEmailTemplate(
                "New Ticket Assigned to You",
                "A ticket has been assigned to you. Please review and take action.",
                ticket.getTitle(),
                ticket.getId().toString().substring(0, 8),
                ticket.getStatus().toString(),
                ticket.getPriority().toString(),
                ticketUrl
            );

            emailService.send(
                assignee.getEmail(),
                "📋 Ticket Assigned: " + ticket.getTitle(),
                html
            );

            // Also notify the ticket owner that their ticket was assigned
            String ownerHtml = buildEmailTemplate(
                "Your Ticket Has Been Assigned",
                "Good news! Your ticket has been assigned to a support agent who will assist you.",
                ticket.getTitle(),
                ticket.getId().toString().substring(0, 8),
                ticket.getStatus().toString(),
                ticket.getPriority().toString(),
                ticketUrl
            );

            emailService.send(
                ticket.getOwner().getEmail(),
                "👤 Agent Assigned to Your Ticket: " + ticket.getTitle(),
                ownerHtml
            );
        } catch (Exception e) {
            log.warn("Failed to send ticket assigned notification: {}", e.getMessage());
        }
    }

    // STATUS CHANGED - Notify ticket owner (uses event data directly to avoid race condition)
    @Async
    @EventListener
    public void onStatusChanged(TicketStatusChangedEvent event) {
        try {
            String statusMessage = getStatusMessage(event.newStatus());
            String emoji = getStatusEmoji(event.newStatus());
            String ticketUrl = frontendUrl + "/dashboard/tickets/" + event.ticketId();
            
            String html = buildEmailTemplate(
                "Ticket Status Updated",
                statusMessage,
                event.ticketTitle(),
                event.ticketId().toString().substring(0, 8),
                event.newStatus(),
                event.priority(),
                ticketUrl
            );

            emailService.send(
                event.ownerEmail(),
                emoji + " Ticket " + event.newStatus() + ": " + event.ticketTitle(),
                html
            );
        } catch (Exception e) {
            log.warn("Failed to send status changed notification: {}", e.getMessage());
        }
    }

    // COMMENT ADDED - Notify ticket owner
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onComment(CommentAddedEvent event) {
        try {
            TicketEntity ticket = ticketRepository.findById(event.ticketId()).orElse(null);
            if (ticket == null) {
                log.warn("Ticket not found for comment event: {}", event.ticketId());
                return;
            }

            String ticketUrl = frontendUrl + "/dashboard/tickets/" + ticket.getId();
            String html = buildEmailTemplate(
                "New Comment on Your Ticket",
                "A new comment has been added to your ticket. Check it out for updates.",
                ticket.getTitle(),
                ticket.getId().toString().substring(0, 8),
                ticket.getStatus().toString(),
                ticket.getPriority().toString(),
                ticketUrl
            );

            emailService.send(
                ticket.getOwner().getEmail(),
                "💬 New Comment: " + ticket.getTitle(),
                html
            );
        } catch (Exception e) {
            log.warn("Failed to send comment notification: {}", e.getMessage());
        }
    }

    // ATTACHMENT UPLOADED - Notify ticket owner
    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onAttachment(AttachmentUploadedEvent event) {
        try {
            TicketEntity ticket = ticketRepository.findById(event.ticketId()).orElse(null);
            if (ticket == null) {
                log.warn("Ticket not found for attachment event: {}", event.ticketId());
                return;
            }

            String ticketUrl = frontendUrl + "/dashboard/tickets/" + ticket.getId();
            String html = buildEmailTemplate(
                "Attachment Added to Your Ticket",
                "A new file has been attached to your ticket.",
                ticket.getTitle(),
                ticket.getId().toString().substring(0, 8),
                ticket.getStatus().toString(),
                ticket.getPriority().toString(),
                ticketUrl
            );

            emailService.send(
                ticket.getOwner().getEmail(),
                "📎 Attachment Added: " + ticket.getTitle(),
                html
            );
        } catch (Exception e) {
            log.warn("Failed to send attachment notification: {}", e.getMessage());
        }
    }

    private String getStatusMessage(String status) {
        return switch (status) {
            case "OPEN" -> "Your ticket is now open and waiting for review.";
            case "IN_PROGRESS" -> "Great news! Your ticket is now being worked on by our support team.";
            case "RESOLVED" -> "Your ticket has been resolved. If you're satisfied, no action is needed. You can reopen it if the issue persists.";
            default -> "Your ticket status has been updated.";
        };
    }

    private String getStatusEmoji(String status) {
        return switch (status) {
            case "OPEN" -> "🔵";
            case "IN_PROGRESS" -> "🟡";
            case "RESOLVED" -> "✅";
            default -> "📋";
        };
    }

    private String buildEmailTemplate(String title, String message, String ticketTitle, String ticketId, String status, String priority, String ticketUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%%, #1d4ed8 100%%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">TicketsManage</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #18181b; margin: 0 0 15px 0; font-size: 20px;">%s</h2>
                            <p style="color: #52525b; margin: 0 0 25px 0; font-size: 15px; line-height: 1.6;">%s</p>
                            
                            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                                <table width="100%%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #71717a; font-size: 13px;">Ticket Title</span><br>
                                            <span style="color: #18181b; font-size: 15px; font-weight: 600;">%s</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #71717a; font-size: 13px;">Ticket ID</span><br>
                                            <span style="color: #18181b; font-size: 15px; font-family: monospace;">#%s</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #71717a; font-size: 13px;">Status</span><br>
                                            <span style="color: #18181b; font-size: 15px; font-weight: 500;">%s</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #71717a; font-size: 13px;">Priority</span><br>
                                            <span style="color: #18181b; font-size: 15px; font-weight: 500;">%s</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%%, #1d4ed8 100%%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Ticket</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f4f4f5; padding: 20px 30px; text-align: center;">
                            <p style="color: #71717a; margin: 0; font-size: 13px;">
                                This is an automated message from TicketsManage.<br>
                                Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(title, message, ticketTitle, ticketId, status, priority, ticketUrl);
    }
}
