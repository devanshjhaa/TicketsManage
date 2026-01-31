package com.ticketsmanage.backend.user.service;

import com.ticketsmanage.backend.user.dto.UpdateUserRoleRequest;
import com.ticketsmanage.backend.user.dto.UpdateUserStatusRequest;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import com.ticketsmanage.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

        private final UserRepository userRepository;

        @Transactional
        public void updateUserRole(
                        UUID userId,
                        UpdateUserRoleRequest request) {

                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Prevent removing last admin
                if (user.getRole() == UserRole.ADMIN
                                && request.role() != UserRole.ADMIN) {

                        long adminCount = userRepository.findAll()
                                        .stream()
                                        .filter(u -> u.getRole() == UserRole.ADMIN)
                                        .count();

                        if (adminCount <= 1) {
                                throw new RuntimeException(
                                                "Cannot remove the last admin");
                        }
                }

                user.setRole(request.role());

                userRepository.save(user);
        }

        @Transactional
        public void updateUserStatus(
                        UUID userId,
                        UpdateUserStatusRequest request) {

                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Prevent disabling last active admin
                if (user.getRole() == UserRole.ADMIN
                                && !request.active()) {

                        long activeAdmins = userRepository.findAll()
                                        .stream()
                                        .filter(u -> u.getRole() == UserRole.ADMIN &&
                                                        u.isActive())
                                        .count();

                        if (activeAdmins <= 1) {
                                throw new RuntimeException(
                                                "Cannot disable the last active admin");
                        }
                }

                user.setActive(request.active());

                userRepository.save(user);
        }

        @Transactional
        public void updateUserPhoto(UUID userId, MultipartFile file) {
                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                try {
                        Path userDir = Paths.get("uploads/users").resolve(userId.toString());
                        Files.createDirectories(userDir);

                        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        Path targetPath = userDir.resolve(storedName);

                        Files.copy(file.getInputStream(), targetPath);

                        // Store the path relative to project root or accessible via API
                        // Storing absolute string or relative string: "uploads/users/..."
                        user.setProfilePictureUrl(targetPath.toString());
                        userRepository.save(user);

                } catch (IOException e) {
                        throw new RuntimeException("Failed to store file", e);
                }
        }
}
