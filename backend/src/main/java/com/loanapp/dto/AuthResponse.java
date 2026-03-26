package com.loanapp.dto;

import java.util.Set;
import java.util.UUID;

public class AuthResponse {
  private String accessToken;
  private String refreshToken;
  private UserDto user;

  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public String getRefreshToken() {
    return refreshToken;
  }

  public void setRefreshToken(String refreshToken) {
    this.refreshToken = refreshToken;
  }

  public UserDto getUser() {
    return user;
  }

  public void setUser(UserDto user) {
    this.user = user;
  }

  public static class UserDto {
    private UUID id;
    private String email;
    private String fullName;
    private UUID tenantId;
    private String tenantName;
    private Set<String> roles;

    public UUID getId() {
      return id;
    }

    public void setId(UUID id) {
      this.id = id;
    }

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }

    public String getFullName() {
      return fullName;
    }

    public void setFullName(String fullName) {
      this.fullName = fullName;
    }

    public UUID getTenantId() {
      return tenantId;
    }

    public void setTenantId(UUID tenantId) {
      this.tenantId = tenantId;
    }

    public String getTenantName() {
      return tenantName;
    }

    public void setTenantName(String tenantName) {
      this.tenantName = tenantName;
    }

    public Set<String> getRoles() {
      return roles;
    }

    public void setRoles(Set<String> roles) {
      this.roles = roles;
    }
  }
}

