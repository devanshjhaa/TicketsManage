package com.ticketsmanage.backend.security.dto;

public record LoginRequest(
        String email,
        String password
) {}
