package com.ticketsmanage.backend.attachment.service;

import com.ticketsmanage.backend.attachment.dto.AttachmentResponse;
import com.ticketsmanage.backend.attachment.dto.UploadAttachmentResponse;
import com.ticketsmanage.backend.attachment.entity.AttachmentEntity;
import com.ticketsmanage.backend.attachment.repository.AttachmentRepository;
import com.ticketsmanage.backend.security.util.SecurityUtils;
import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    private static final Path BASE_DIR =
            Paths.get("uploads/tickets");

    // UPLOAD
    @Transactional
    public UploadAttachmentResponse upload(
            UUID ticketId,
            MultipartFile file
    ) {

        TicketEntity ticket =
                ticketRepository.findByIdAndDeletedFalse(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException("Ticket not found"));

        UserEntity currentUser = getCurrentUser();

        validateCanAccess(ticket, currentUser);

        try {

            Path ticketDir =
                    BASE_DIR.resolve(ticketId.toString());

            Files.createDirectories(ticketDir);

            String storedName =
                    UUID.randomUUID() + "_" +
                            file.getOriginalFilename();

            Path targetPath =
                    ticketDir.resolve(storedName);

            Files.copy(file.getInputStream(), targetPath);

            AttachmentEntity entity =
                    AttachmentEntity.builder()
                            .ticket(ticket)
                            .uploadedBy(currentUser)
                            .fileName(file.getOriginalFilename())
                            .contentType(file.getContentType())
                            .fileSize(file.getSize())
                            .storagePath(targetPath.toString())
                            .deleted(false)
                            .build();

            AttachmentEntity saved =
                    attachmentRepository.save(entity);

            return new UploadAttachmentResponse(saved.getId());

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store file", e);
        }
    }

    // LIST
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(
            UUID ticketId
    ) {

        TicketEntity ticket =
                ticketRepository.findByIdAndDeletedFalse(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException("Ticket not found"));

        UserEntity currentUser = getCurrentUser();

        validateCanAccess(ticket, currentUser);

        return attachmentRepository
                .findByTicketAndDeletedFalse(ticket)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // DOWNLOAD
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> download(
            UUID ticketId,
            UUID attachmentId
    ) {

        AttachmentEntity attachment =
                attachmentRepository
                        .findByIdAndDeletedFalse(attachmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Attachment not found"));

        TicketEntity ticket =
                attachment.getTicket();

        UserEntity currentUser =
                getCurrentUser();

        validateCanAccess(ticket, currentUser);

        if (!ticket.getId().equals(ticketId)) {
            throw new RuntimeException(
                    "Attachment does not belong to ticket");
        }

        try {

            Path path =
                    Paths.get(
                            attachment.getStoragePath());

            Resource resource =
                    new UrlResource(path.toUri());

            if (!resource.exists()) {
                throw new RuntimeException(
                        "File missing on disk");
            }

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    attachment.getContentType()))
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    attachment.getFileName() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            throw new RuntimeException(
                    "Invalid file path", e);
        }
    }

    // SOFT DELETE
    @Transactional
    public void softDelete(
            UUID ticketId,
            UUID attachmentId
    ) {

        TicketEntity ticket =
                ticketRepository
                        .findByIdAndDeletedFalse(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"));

        UserEntity currentUser =
                getCurrentUser();

        validateCanAccess(ticket, currentUser);

        AttachmentEntity attachment =
                attachmentRepository
                        .findByIdAndDeletedFalse(attachmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Attachment not found"));

        if (!attachment.getTicket()
                .getId()
                .equals(ticketId)) {

            throw new RuntimeException(
                    "Attachment does not belong to ticket");
        }

        attachment.setDeleted(true);
    }

    // SECURITY
    private UserEntity getCurrentUser() {

        String email =
                SecurityUtils.getCurrentUsername();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));
    }

    private void validateCanAccess(
            TicketEntity ticket,
            UserEntity user
    ) {

        boolean isAdmin =
                user.getRole() == UserRole.ADMIN;

        boolean isOwner =
                ticket.getOwner()
                        .getId()
                        .equals(user.getId());

        boolean isAssignee =
                ticket.getAssignee() != null &&
                        ticket.getAssignee()
                                .getId()
                                .equals(user.getId());

        if (!(isAdmin || isOwner || isAssignee)) {
            throw new AccessDeniedException(
                    "You cannot access attachments for this ticket");
        }
    }

    // MAPPING
    private AttachmentResponse toResponse(
            AttachmentEntity entity
    ) {

        return new AttachmentResponse(
                entity.getId(),
                entity.getFileName(),
                entity.getContentType(),
                entity.getFileSize(),
                entity.getCreatedAt()
        );
    }
}
