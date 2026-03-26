package com.loanapp.security;

import com.loanapp.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

  private final String secret;
  private final long accessTokenExpirySeconds;

  public JwtTokenProvider(
      @Value("${jwt.secret}") String secret,
      @Value("${jwt.access-token-expiry:900}") long accessTokenExpirySeconds
  ) {
    this.secret = secret;
    this.accessTokenExpirySeconds = accessTokenExpirySeconds;
  }

  public String generateToken(User user) {
    Instant now = Instant.now();
    Date exp = Date.from(now.plusSeconds(accessTokenExpirySeconds));

    List<String> roles = List.copyOf(user.getRoles());

    SecretKey key = key();
    return Jwts.builder()
        .setSubject(user.getId().toString())
        .claim("tenantId", user.getTenant().getId().toString())
        .claim("roles", roles)
        .setExpiration(exp)
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public boolean validateToken(String token) {
    try {
      parseClaims(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public UUID getUserId(String token) {
    Claims claims = parseClaims(token);
    return UUID.fromString(claims.getSubject());
  }

  public UUID getTenantId(String token) {
    Claims claims = parseClaims(token);
    return UUID.fromString(String.valueOf(claims.get("tenantId")));
  }

  @SuppressWarnings("unchecked")
  public List<String> getRoles(String token) {
    Claims claims = parseClaims(token);
    Object rolesObj = claims.get("roles");
    if (rolesObj instanceof List<?>) {
      return ((List<?>) rolesObj).stream().map(String::valueOf).toList();
    }
    return List.of();
  }

  private Claims parseClaims(String token) {
    SecretKey key = key();
    // Using Jwts.parser() to stay compatible with the jjwt API available at compile time.
    return Jwts.parser()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  private SecretKey key() {
    // Ensure secret is at least 256 bits for HS256
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }
}

