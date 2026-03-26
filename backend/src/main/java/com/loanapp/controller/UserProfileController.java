package com.loanapp.controller;

import com.loanapp.config.TenantContext;
import com.loanapp.dto.PasswordChangeRequest;
import com.loanapp.dto.ProfileUpdateRequest;
import com.loanapp.dto.SignupRequest;
import com.loanapp.dto.UserProfileDto;
import com.loanapp.repository.UserRepository;
import com.loanapp.service.UserService;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserProfileController {

  private final UserService userService;

  public UserProfileController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  public UserProfileDto getProfile() {
    UUID userId = currentUserId();
    return userService.getProfile(userId);
  }

  @PutMapping("/me")
  public UserProfileDto updateProfile(@RequestBody ProfileUpdateRequest request) {
    UUID userId = currentUserId();
    return userService.updateProfile(userId, request);
  }

  @PutMapping("/me/password")
  public ResponseEntity<Map<String, String>> changePassword(@RequestBody PasswordChangeRequest request) {
    UUID userId = currentUserId();
    userService.changePassword(userId, request);
    return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
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
