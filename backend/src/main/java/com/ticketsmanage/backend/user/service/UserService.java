package com.ticketsmanage.backend.user.service;

import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.ticket.repository.TicketRepository;
import com.ticketsmanage.backend.user.dto.AgentStatsResponse;
import com.ticketsmanage.backend.user.dto.UserResponse;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private static final String UPLOAD_DIR = "uploads/profiles/";

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserById(UUID id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(user);
    }

    public UserResponse getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toResponse(user);
    }

    public UserResponse updateProfilePicture(Authentication authentication, MultipartFile file) throws IOException {
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Path uploadPath = Paths.get(UPLOAD_DIR + user.getId());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : ".jpg";
        String filename = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(filename);

        if (user.getProfilePictureUrl() != null) {
            try {
                Files.deleteIfExists(Paths.get(user.getProfilePictureUrl()));
            } catch (IOException ignored) {}
        }

        Files.copy(file.getInputStream(), filePath);

        user.setProfilePictureUrl(filePath.toString());
        userRepository.save(user);

        return toResponse(user);
    }

    private UserResponse toResponse(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isActive(),
                user.getProfilePictureUrl());
    }

    public AgentStatsResponse getAgentStats(Authentication authentication) {
        String email = authentication.getName();
        UserEntity agent = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalAssigned = ticketRepository.countByAssigneeAndDeletedFalse(agent);
        long resolved = ticketRepository.countByAssigneeAndStatusAndDeletedFalse(agent, TicketStatus.RESOLVED);
        long open = ticketRepository.countByAssigneeAndStatusAndDeletedFalse(agent, TicketStatus.OPEN);
        long inProgress = ticketRepository.countByAssigneeAndStatusAndDeletedFalse(agent, TicketStatus.IN_PROGRESS);

        List<TicketEntity> ratedTickets = ticketRepository.findByAssigneeAndRatingIsNotNullAndDeletedFalse(agent);
        int totalRatings = ratedTickets.size();
        Double averageRating = null;
        
        if (totalRatings > 0) {
            double sum = ratedTickets.stream()
                    .mapToInt(TicketEntity::getRating)
                    .sum();
            averageRating = Math.round((sum / totalRatings) * 10.0) / 10.0; // Round to 1 decimal
        }

        return new AgentStatsResponse(
                totalAssigned,
                resolved,
                open,
                inProgress,
                totalRatings,
                averageRating
        );
    }
}
