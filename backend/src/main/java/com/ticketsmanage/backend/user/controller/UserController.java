package com.ticketsmanage.backend.user.controller;

import com.ticketsmanage.backend.user.dto.AgentStatsResponse;
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



}
