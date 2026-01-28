package com.ticketsmanage.backend.user.controller;

import com.ticketsmanage.backend.user.dto.UserResponse;
import com.ticketsmanage.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
}
