package com.loanapp.dto;

import java.util.Set;

public class RoleUpdateRequest {
  private Set<String> roles;

  public Set<String> getRoles() {
    return roles;
  }

  public void setRoles(Set<String> roles) {
    this.roles = roles;
  }
}
