package com.ticketsmanage.backend.user.controller;

import com.ticketsmanage.backend.user.dto.UserResponse;
import com.ticketsmanage.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
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

    private final UserService UserService;

    // Get all users (ADMIN)
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return UserService.getAllUsers();
    }

    // Get one user by id
    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return UserService.getUserById(id);
    }

    @GetMapping("/me")
    public UserResponse getMe(org.springframework.security.core.Authentication authentication) {
        return UserService.getCurrentUser(authentication);
    }

    // SERVE PROFILE PICTURE
    @GetMapping("/{id}/profile-picture")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable UUID id) {
        UserResponse user = UserService.getUserById(id);
        if (user.profilePictureUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path path = Paths.get(user.profilePictureUrl());
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) // Naive, should detect type or use generic image/*
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
