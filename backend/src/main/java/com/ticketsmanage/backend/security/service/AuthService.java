package com.ticketsmanage.backend.security.service;

import com.ticketsmanage.backend.security.dto.AuthResponse;
import com.ticketsmanage.backend.security.dto.LoginRequest;
import com.ticketsmanage.backend.security.dto.RegisterRequest;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);
}