package com.ticketsmanage.backend.security.controller;

import com.ticketsmanage.backend.security.dto.AuthResponse;
import com.ticketsmanage.backend.security.dto.LoginRequest;
import com.ticketsmanage.backend.security.dto.RegisterRequest;
import com.ticketsmanage.backend.security.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletResponse response) {

        AuthResponse authResponse = authService.login(request);

        // authResponse must contain token
        String token = authResponse.accessToken();

        // Use Set-Cookie header directly for better control over SameSite attribute
        int maxAge = 15 * 60; // 15 minutes
        response.setHeader("Set-Cookie", 
            String.format("accessToken=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax", token, maxAge));

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(jakarta.servlet.http.HttpServletResponse response) {
        // Use Set-Cookie header directly for better control over SameSite attribute
        response.setHeader("Set-Cookie", "accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
        return ResponseEntity.ok().build();
    }
}
