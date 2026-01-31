package com.ticketsmanage.backend.user.controller;

import com.ticketsmanage.backend.user.dto.AgentStatsResponse;
import com.ticketsmanage.backend.user.dto.UserResponse;
import com.ticketsmanage.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @GetMapping("/me")
    public UserResponse getMe(org.springframework.security.core.Authentication authentication) {
        return userService.getCurrentUser(authentication);
    }

    @GetMapping("/me/stats")
    public AgentStatsResponse getAgentStats(org.springframework.security.core.Authentication authentication) {
        return userService.getAgentStats(authentication);
    }

    @PostMapping("/me/profile-picture")
    public UserResponse uploadProfilePicture(
            org.springframework.security.core.Authentication authentication,
            @RequestParam("file") MultipartFile file) throws IOException {
        return userService.updateProfilePicture(authentication, file);
    }

    @GetMapping("/{id}/profile-picture")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        if (user.profilePictureUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path path = Paths.get(user.profilePictureUrl());
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
