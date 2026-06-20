package com.amr.campus_operations_ai.security;

import java.util.Date;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${app.jwt.secret:change-me-change-me-change-me}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private Algorithm algorithm() {
        return Algorithm.HMAC256(jwtSecret.getBytes());
    }

    public String generateToken(String subject, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);
        return JWT.create()
                .withSubject(subject)
                .withClaim("role", role)
                .withIssuedAt(now)
                .withExpiresAt(exp)
                .sign(algorithm());
    }

    public DecodedJWT verify(String token) {
        JWTVerifier verifier = JWT.require(algorithm()).build();
        return verifier.verify(token);
    }

    public boolean validateToken(String token) {
        try {
            verify(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
