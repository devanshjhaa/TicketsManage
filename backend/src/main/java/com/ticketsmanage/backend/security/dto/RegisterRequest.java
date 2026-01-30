package com.ticketsmanage.backend.security.dto;

public record RegisterRequest(
        String email,
        String password,
        String firstName,
        String lastName,
        String secretCode  // Optional: for admin/agent registration
) {}
