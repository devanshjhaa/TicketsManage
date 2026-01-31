package com.ticketsmanage.backend.attachment.controller;

import com.ticketsmanage.backend.attachment.dto.AttachmentResponse;
import com.ticketsmanage.backend.attachment.dto.UploadAttachmentResponse;
import com.ticketsmanage.backend.attachment.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
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
    public List<AttachmentResponse> list(
            @PathVariable UUID ticketId
    ) {
        return attachmentService.getAttachments(ticketId);
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable UUID ticketId,
            @PathVariable UUID attachmentId
    ) {
        return attachmentService.download(ticketId, attachmentId);
    }

    @DeleteMapping("/{attachmentId}")
    public void delete(
            @PathVariable UUID ticketId,
            @PathVariable UUID attachmentId
    ) {
        attachmentService.softDelete(ticketId, attachmentId);
    }
}
