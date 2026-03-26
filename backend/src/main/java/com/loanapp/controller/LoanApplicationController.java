package com.loanapp.controller;

import com.loanapp.config.TenantContext;
import com.loanapp.dto.LoanApplicationDto;
import com.loanapp.dto.StatusUpdateRequest;
import com.loanapp.service.LoanApplicationService;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/applications")
public class LoanApplicationController {

  private final LoanApplicationService loanApplicationService;

  public LoanApplicationController(LoanApplicationService loanApplicationService) {
    this.loanApplicationService = loanApplicationService;
  }

  @GetMapping
  public Page<LoanApplicationDto> getApplications(
      @RequestParam(name = "status", required = false) String status,
      @RequestParam(name = "page", required = false, defaultValue = "0") int page,
      @RequestParam(name = "size", required = false, defaultValue = "20") int size
  ) {
    UUID tenantId = TenantContext.get();
    UUID userId = currentUserId();
    boolean applicantOnly = hasRole("APPLICANT")
        && !hasRole("LOAN_OFFICER", "FINANCE_OFFICER", "TENANT_ADMIN");

    return loanApplicationService.listApplications(
        tenantId,
        userId,
        applicantOnly,
        status,
        PageRequest.of(page, size)
    );
  }

  @PostMapping
  @PreAuthorize("hasAuthority('APPLICANT')")
  public LoanApplicationDto submitApplication(@RequestBody LoanApplicationDto request) {
    UUID tenantId = TenantContext.get();
    UUID applicantId = currentUserId();

    return loanApplicationService.createApplication(
        tenantId,
        applicantId,
        request.getLoanType(),
        request.getFormData(),
        request.getSchemaVersion(),
        false
    );
  }

  @PostMapping("/draft")
  @PreAuthorize("hasAuthority('APPLICANT')")
  public LoanApplicationDto saveDraft(@RequestBody LoanApplicationDto request) {
    UUID tenantId = TenantContext.get();
    UUID applicantId = currentUserId();

    return loanApplicationService.createApplication(
        tenantId,
        applicantId,
        request.getLoanType(),
        request.getFormData(),
        request.getSchemaVersion(),
        true
    );
  }

  @GetMapping("/{id}")
  public LoanApplicationDto getApplication(@PathVariable("id") UUID id) {
    UUID tenantId = TenantContext.get();
    UUID userId = currentUserId();
    boolean applicantOnly = hasRole("APPLICANT")
        && !hasRole("LOAN_OFFICER", "FINANCE_OFFICER", "TENANT_ADMIN");

    return loanApplicationService.getApplicationById(
        tenantId,
        userId,
        applicantOnly,
        id
    );
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasAnyAuthority('LOAN_OFFICER','FINANCE_OFFICER','TENANT_ADMIN')")
  public LoanApplicationDto updateStatus(
      @PathVariable("id") UUID id,
      @RequestBody StatusUpdateRequest request
  ) {
    UUID tenantId = TenantContext.get();
    UUID actorId = currentUserId();

    if (request.getComments() == null || request.getComments().isBlank()) {
      throw new IllegalArgumentException("comments is required");
    }

    return loanApplicationService.updateStatus(
        tenantId,
        actorId,
        id,
        request.getStatus(),
        request.getComments()
    );
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
  }

  private UUID currentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return (UUID) auth.getPrincipal();
  }

  private boolean hasRole(String... roles) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getAuthorities() == null) return false;
    return auth.getAuthorities().stream().anyMatch(a -> {
      for (String role : roles) {
        if (role.equals(a.getAuthority())) return true;
      }
      return false;
    });
  }
}

