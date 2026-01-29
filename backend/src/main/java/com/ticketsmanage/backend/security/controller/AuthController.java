package com.ticketsmanage.backend.security.controller;

import com.ticketsmanage.backend.security.dto.AuthResponse;
import com.ticketsmanage.backend.security.dto.LoginRequest;
import com.ticketsmanage.backend.security.dto.RegisterRequest;
import com.ticketsmanage.backend.security.service.AuthService;
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
            @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletResponse response
    ) {

        AuthResponse authResponse = authService.login(request);

        // authResponse must contain token
        String token = authResponse.getAccessToken();

        jakarta.servlet.http.Cookie cookie =
                new jakarta.servlet.http.Cookie("accessToken", token);

        cookie.setHttpOnly(true);
        cookie.setSecure(false); // true in prod
        cookie.setPath("/");
        cookie.setMaxAge(15 * 60);

        response.addCookie(cookie);

        return ResponseEntity.ok(authResponse);
    }


    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }
}
