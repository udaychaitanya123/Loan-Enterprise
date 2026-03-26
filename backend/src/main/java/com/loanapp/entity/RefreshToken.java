package com.loanapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
  public RefreshToken() {}

  @Id
  @Column(name = "user_id")
  private UUID userId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
  private User user;

  @Column(name = "token_hash", nullable = false)
  private String tokenHash;

  @Column(name = "expires_at", nullable = false)
  private OffsetDateTime expiresAt;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  public UUID getUserId() {
    return userId;
  }

  public User getUser() {
    return user;
  }

  public String getTokenHash() {
    return tokenHash;
  }

  public OffsetDateTime getExpiresAt() {
    return expiresAt;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setUser(User user) {
    this.user = user;
    this.userId = user.getId();
  }

  public void setTokenHash(String tokenHash) {
    this.tokenHash = tokenHash;
  }

  public void setExpiresAt(OffsetDateTime expiresAt) {
    this.expiresAt = expiresAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}

