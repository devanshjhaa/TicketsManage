package com.ticketsmanage.backend.attachment.service;

import com.ticketsmanage.backend.attachment.dto.AttachmentResponse;
import com.ticketsmanage.backend.attachment.dto.UploadAttachmentResponse;
import com.ticketsmanage.backend.attachment.entity.AttachmentEntity;
import com.ticketsmanage.backend.attachment.repository.AttachmentRepository;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    public UploadAttachmentResponse upload(UUID ticketId, MultipartFile file) {

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // TODO later integrate S3 / local storage
        AttachmentEntity entity = new AttachmentEntity();
        entity.setTicket(ticket);
        entity.setFileName(file.getOriginalFilename());
        entity.setMimeType(file.getContentType());
        entity.setSizeBytes(file.getSize());
        entity.setStorageKey("temp/" + UUID.randomUUID());

        AttachmentEntity saved = attachmentRepository.save(entity);

        return new UploadAttachmentResponse(saved.getId());
    }

    public List<AttachmentResponse> getAttachments(UUID ticketId) {

        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return attachmentRepository.findByTicket(ticket)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AttachmentResponse toResponse(AttachmentEntity entity) {

        return new AttachmentResponse(
                entity.getId(),
                entity.getFileName(),
                entity.getMimeType(),
                entity.getSizeBytes(),
                entity.getUploadedAt()
        );
    }
}
