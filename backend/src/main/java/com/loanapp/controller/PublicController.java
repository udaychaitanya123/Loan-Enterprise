package com.loanapp.controller;

import com.loanapp.dto.TenantPublicDto;
import com.loanapp.repository.TenantRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
public class PublicController {

  private final TenantRepository tenantRepository;

  public PublicController(TenantRepository tenantRepository) {
    this.tenantRepository = tenantRepository;
  }

  @GetMapping("/tenants")
  public List<TenantPublicDto> getTenants() {
    return tenantRepository.findAll().stream()
        .map(t -> new TenantPublicDto(t.getDomainKey(), t.getName()))
        .collect(Collectors.toList());
  }
}
