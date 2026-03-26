package com.loanapp.service;

import com.loanapp.dto.AuthResponse;
import com.loanapp.entity.RefreshToken;
import com.loanapp.entity.User;
import com.loanapp.repository.RefreshTokenRepository;
import com.loanapp.repository.UserRepository;
import com.loanapp.security.JwtTokenProvider;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final long refreshTokenExpirySeconds;

  public AuthService(
      UserRepository userRepository,
      RefreshTokenRepository refreshTokenRepository,
      PasswordEncoder passwordEncoder,
      JwtTokenProvider jwtTokenProvider,
      @Value("${jwt.refresh-token-expiry:604800}") long refreshTokenExpirySeconds
  ) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenProvider = jwtTokenProvider;
    this.refreshTokenExpirySeconds = refreshTokenExpirySeconds;
  }

  @Transactional
  public AuthResponse login(String email, String password) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    String accessToken = jwtTokenProvider.generateToken(user);
    String refreshToken = issueRefreshToken(user);

    return toAuthResponse(accessToken, refreshToken, user);
  }

  @Transactional
  public AuthResponse refresh(String refreshTokenRaw) {
    String tokenHash = sha256(refreshTokenRaw);

    RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
        .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

    if (refreshToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
      throw new IllegalArgumentException("Refresh token expired");
    }

    User user = refreshToken.getUser();
    String accessToken = jwtTokenProvider.generateToken(user);

    // Rotate refresh token (simple MVP)
    String newRefreshToken = issueRefreshToken(user);
    refreshTokenRepository.delete(refreshToken);

    return toAuthResponse(accessToken, newRefreshToken, user);
  }

  private String issueRefreshToken(User user) {
    String refreshTokenRaw = UUID.randomUUID().toString();
    String tokenHash = sha256(refreshTokenRaw);
    OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(refreshTokenExpirySeconds);

    RefreshToken entity = new RefreshToken();
    entity.setUser(user);
    entity.setTokenHash(tokenHash);
    entity.setExpiresAt(expiresAt);
    entity.setCreatedAt(OffsetDateTime.now());

    // one row per user
    refreshTokenRepository.findById(user.getId()).ifPresent(refreshTokenRepository::delete);
    refreshTokenRepository.save(entity);

    return refreshTokenRaw;
  }

  private AuthResponse toAuthResponse(String accessToken, String refreshToken, User user) {
    AuthResponse response = new AuthResponse();
    response.setAccessToken(accessToken);
    response.setRefreshToken(refreshToken);
    AuthResponse.UserDto userDto = new AuthResponse.UserDto();
    userDto.setId(user.getId());
    userDto.setEmail(user.getEmail());
    userDto.setFullName(user.getFullName());
    userDto.setTenantId(user.getTenant().getId());
    userDto.setTenantName(user.getTenant().getName());
    userDto.setRoles(Set.copyOf(user.getRoles()));
    response.setUser(userDto);
    return response;
  }

  private String sha256(String input) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashed = digest.digest(input.getBytes(StandardCharsets.UTF_8));
      StringBuilder sb = new StringBuilder();
      for (byte b : hashed) {
        sb.append(String.format("%02x", b));
      }
      return sb.toString();
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("SHA-256 not available", e);
    }
  }
}

