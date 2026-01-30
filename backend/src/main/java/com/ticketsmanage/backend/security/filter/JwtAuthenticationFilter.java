package com.ticketsmanage.backend.security.filter;

import com.ticketsmanage.backend.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
) throws ServletException, IOException {

    System.out.println(">>> JWT FILTER PATH = " + request.getServletPath());

    String jwt = null;

    // 1️⃣ Try Authorization header first
    final String authHeader =
            request.getHeader(HttpHeaders.AUTHORIZATION);

    System.out.println(">>> AUTH HEADER = " + authHeader);

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        jwt = authHeader.substring(7);
    }

    // 2️⃣ If no header token, try cookie
    if (jwt == null && request.getCookies() != null) {
        System.out.println(">>> COOKIES FOUND: " + request.getCookies().length);
        for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
            System.out.println(">>> COOKIE: " + cookie.getName() + " = " + (cookie.getValue() != null ? cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "..." : "null"));
            if ("accessToken".equals(cookie.getName())) {
                jwt = cookie.getValue();
                break;
            }
        }
    } else if (request.getCookies() == null) {
        System.out.println(">>> NO COOKIES IN REQUEST");
    }

    // 3️⃣ If still no token, continue filter chain
    if (jwt == null) {
        System.out.println(">>> NO JWT FOUND — SKIPPING");
        filterChain.doFilter(request, response);
        return;
    }

    String username = jwtService.extractSubject(jwt);
    String role = jwtService.extractRole(jwt);

    System.out.println(">>> JWT SUBJECT = " + username);
    System.out.println(">>> JWT ROLE = " + role);

    if (username != null &&
            SecurityContextHolder.getContext()
                    .getAuthentication() == null &&
            jwtService.isTokenValid(jwt)) {

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(username);

        var authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        System.out.println(">>> SETTING AUTH = " + authorities);

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                );

        authToken.setDetails(
                new WebAuthenticationDetailsSource()
                        .buildDetails(request)
        );

        SecurityContextHolder.getContext()
                .setAuthentication(authToken);
    }

    filterChain.doFilter(request, response);
}


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/api/auth")
                || path.startsWith("/actuator")
                || path.equals("/health");
    }
}
