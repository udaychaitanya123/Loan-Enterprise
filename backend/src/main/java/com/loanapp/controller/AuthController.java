package com.loanapp.controller;

import com.loanapp.dto.AuthResponse;
import com.loanapp.dto.LoginRequest;
import com.loanapp.service.AuthService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public AuthResponse login(@RequestBody LoginRequest request) {
    return authService.login(request.getEmail(), request.getPassword());
  }

  @PostMapping("/refresh")
  public AuthResponse refresh(@RequestBody Map<String, String> body) {
    String refreshToken = body.get("refreshToken");
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new IllegalArgumentException("Missing refreshToken");
    }
    return authService.refresh(refreshToken);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
  }
}

