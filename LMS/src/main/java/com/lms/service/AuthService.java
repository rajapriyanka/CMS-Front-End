package com.lms.service;

import com.lms.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public String login(String username, String password) {
        try {
            // Authenticate the user with the username and password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // Retrieve user details
            UserDetails user = (UserDetails) authentication.getPrincipal();

            // Generate and return JWT token
            return jwtTokenProvider.generateToken(username, user.getAuthorities().iterator().next().getAuthority());
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid username/password supplied");
        }
    }
}
