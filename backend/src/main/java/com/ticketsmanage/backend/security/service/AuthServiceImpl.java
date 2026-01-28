package com.ticketsmanage.backend.security.service;

import com.ticketsmanage.backend.security.dto.AuthResponse;
import com.ticketsmanage.backend.security.dto.LoginRequest;
import com.ticketsmanage.backend.security.dto.RegisterRequest;
import com.ticketsmanage.backend.security.jwt.JwtService;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import com.ticketsmanage.backend.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // authenticate credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // load user
        UserEntity user = userRepository.findByEmail(request.email())
                .orElseThrow();

        // generate jwt with role
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(token);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {

        // check if user already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("User already exists with email: " + request.email());
        }

        // create new user
        UserEntity user = UserEntity.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .role(UserRole.USER)
                .active(true)
                .build();

        userRepository.save(user);

        // generate jwt token
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(token);
    }
}