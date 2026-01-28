package com.ticketsmanage.backend.attachment.controller;

import com.ticketsmanage.backend.attachment.dto.AttachmentResponse;
import com.ticketsmanage.backend.attachment.dto.UploadAttachmentResponse;
import com.ticketsmanage.backend.attachment.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping
    public UploadAttachmentResponse upload(
            @PathVariable UUID ticketId,
            @RequestParam("file") MultipartFile file
    ) {
        return attachmentService.upload(ticketId, file);
    }

    @GetMapping
    public List<AttachmentResponse> list(@PathVariable UUID ticketId) {
        return attachmentService.getAttachments(ticketId);
    }
}
