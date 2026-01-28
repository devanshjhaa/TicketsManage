package com.ticketsmanage.backend.comment.controller;

import com.ticketsmanage.backend.comment.dto.CommentResponse;
import com.ticketsmanage.backend.comment.dto.CreateCommentRequest;
import com.ticketsmanage.backend.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final CommentService commentService;

    @PostMapping
    public CommentResponse addComment(
            @PathVariable UUID ticketId,
            @RequestBody @Valid CreateCommentRequest request
    ) {
        return commentService.addComment(ticketId, request);
    }

    @GetMapping
    public List<CommentResponse> getComments(@PathVariable UUID ticketId) {
        return commentService.getCommentsForTicket(ticketId);
    }
}
