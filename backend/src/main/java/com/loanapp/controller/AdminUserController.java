package com.loanapp.controller;

import com.loanapp.config.TenantContext;
import com.loanapp.dto.CreateUserRequest;
import com.loanapp.dto.RoleUpdateRequest;
import com.loanapp.dto.UserProfileDto;
import com.loanapp.dto.UserStatusUpdateRequest;
import com.loanapp.service.UserService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasAuthority('TENANT_ADMIN')")
public class AdminUserController {

  private final UserService userService;

  public AdminUserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public List<UserProfileDto> listUsers() {
    UUID tenantId = TenantContext.get();
    return userService.listTenantUsers(tenantId);
  }

  @PostMapping
  public ResponseEntity<UserProfileDto> createUser(@RequestBody CreateUserRequest request) {
    UUID tenantId = TenantContext.get();
    UserProfileDto user = userService.createUser(
        tenantId,
        request.getEmail(),
        request.getFullName(),
        request.getPassword(),
        request.getRole()
    );
    return ResponseEntity.status(HttpStatus.CREATED).body(user);
  }

  @GetMapping("/{userId}")
  public UserProfileDto getUser(@PathVariable UUID userId) {
    UUID tenantId = TenantContext.get();
    return userService.getTenantUser(tenantId, userId);
  }

  @PutMapping("/{userId}/roles")
  public UserProfileDto updateRoles(
      @PathVariable UUID userId,
      @RequestBody RoleUpdateRequest request
  ) {
    UUID tenantId = TenantContext.get();
    UUID actorId = currentUserId();
    return userService.updateRoles(tenantId, actorId, userId, request);
  }

  @PatchMapping("/{userId}/status")
  public UserProfileDto updateStatus(
      @PathVariable UUID userId,
      @RequestBody UserStatusUpdateRequest request
  ) {
    UUID tenantId = TenantContext.get();
    return userService.updateStatus(tenantId, userId, request.getStatus());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
  }

  private UUID currentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return (UUID) auth.getPrincipal();
  }
}
