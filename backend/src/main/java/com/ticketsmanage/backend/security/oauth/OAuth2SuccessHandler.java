package com.ticketsmanage.backend.security.oauth;

import com.ticketsmanage.backend.security.jwt.JwtService;
import com.ticketsmanage.backend.user.entity.UserEntity;
import com.ticketsmanage.backend.user.entity.UserRole;
import com.ticketsmanage.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        String email =
                oauthUser.getAttribute("email");

        String name =
                oauthUser.getAttribute("name");

        String googleId =
                oauthUser.getAttribute("sub");

        UserEntity user =
                userRepository.findByEmail(email)
                        .orElseGet(() -> {

                            UserEntity u =
                                    new UserEntity();

                            u.setEmail(email);
                            u.setGoogleId(googleId);
                            u.setFirstName(name);
                            u.setRole(UserRole.USER);
                            u.setActive(true);

                            return userRepository.save(u);
                        });

                String accessToken =
        jwtService.generateToken(user);

// create HttpOnly cookie
jakarta.servlet.http.Cookie accessCookie =
        new jakarta.servlet.http.Cookie("accessToken", accessToken);

accessCookie.setHttpOnly(true);
accessCookie.setSecure(false); // true in prod with HTTPS
accessCookie.setPath("/");
accessCookie.setMaxAge(15 * 60); // 15 min

response.addCookie(accessCookie);

// redirect to frontend dashboard
response.sendRedirect("http://localhost:3000/dashboard");

    }
}
