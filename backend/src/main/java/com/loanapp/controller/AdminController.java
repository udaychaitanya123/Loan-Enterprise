package com.loanapp.controller;

import com.loanapp.config.TenantContext;
import com.loanapp.entity.Tenant;
import com.loanapp.entity.User;
import com.loanapp.repository.TenantRepository;
import com.loanapp.repository.UserRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final PasswordEncoder passwordEncoder;

  public AdminController(
      UserRepository userRepository,
      TenantRepository tenantRepository,
      PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.tenantRepository = tenantRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @GetMapping("/users")
  @PreAuthorize("hasAuthority('TENANT_ADMIN')")
  public List<User> listTenantUsers() {
    UUID tenantId = TenantContext.get();
    return userRepository.findAllByTenant_Id(tenantId);
  }

  @PostMapping("/users")
  @PreAuthorize("hasAuthority('TENANT_ADMIN')")
  public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
    UUID tenantId = TenantContext.get();
    Tenant tenant = tenantRepository.findById(tenantId)
        .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

    if (request.email == null || request.email.isBlank()) {
      throw new IllegalArgumentException("email is required");
    }
    if (request.fullName == null || request.fullName.isBlank()) {
      throw new IllegalArgumentException("fullName is required");
    }
    if (request.password == null || request.password.isBlank()) {
      throw new IllegalArgumentException("password is required");
    }
    if (request.role == null || request.role.isBlank()) {
      throw new IllegalArgumentException("role is required");
    }

    User user = new User();
    user.setId(UUID.randomUUID());
    user.setTenant(tenant);
    user.setEmail(request.email);
    user.setFullName(request.fullName);
    user.setPasswordHash(passwordEncoder.encode(request.password));
    user.setStatus("ACTIVE");
    user.setRoles(Set.of(request.role));
    user.setCreatedAt(OffsetDateTime.now());
    user.setUpdatedAt(OffsetDateTime.now());

    User saved = userRepository.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
  }

  public static class CreateUserRequest {
    public String email;
    public String fullName;
    public String password;
    public String role;
  }
}

