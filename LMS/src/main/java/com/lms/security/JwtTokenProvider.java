package com.lms.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;

    // Generate a JWT token with username and authority
    public String generateToken(String username, String authority) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(username) // Use the username directly
                .claim("role", authority) // Add the user's authority as a custom claim
                .setIssuedAt(now) // Set the issued date
                .setExpiration(expiryDate) // Set the expiration date
                .signWith(SignatureAlgorithm.HS512, jwtSecret) // Sign the token with the secret
                .compact(); // Build and compact the JWT
    }

    // Extract the username from a JWT token
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject(); // Return the subject (username)
    }

    // Validate the token
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            // log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            // log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            // log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            // log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            // log.error("JWT claims string is empty.");
        }
        return false;
    }
}
