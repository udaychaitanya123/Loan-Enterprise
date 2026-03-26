package com.loanapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
  public User() {}

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tenant_id")
  @JsonIgnore
  private Tenant tenant;

  @Column(nullable = false)
  private String email;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  @JsonIgnore
  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  private String status;

  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  @Column(name = "updated_at")
  private OffsetDateTime updatedAt;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "user_roles",
      joinColumns = @JoinColumn(name = "user_id")
  )
  @Column(name = "role")
  private Set<String> roles = new HashSet<>();

  public UUID getId() {
    return id;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public String getEmail() {
    return email;
  }

  public String getFullName() {
    return fullName;
  }

  public String getStatus() {
    return status;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public Set<String> getRoles() {
    return roles;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public void setTenant(Tenant tenant) {
    this.tenant = tenant;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public void setRoles(Set<String> roles) {
    this.roles = roles;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}

