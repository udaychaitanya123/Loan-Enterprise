package com.loanapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.loanapp.config.TenantContext;
import com.loanapp.entity.FormSchema;
import com.loanapp.entity.Tenant;
import com.loanapp.repository.FormSchemaRepository;
import com.loanapp.repository.TenantRepository;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class FormSchemaService {

  private final FormSchemaRepository formSchemaRepository;
  private final TenantRepository tenantRepository;

  public FormSchemaService(FormSchemaRepository formSchemaRepository, TenantRepository tenantRepository) {
    this.formSchemaRepository = formSchemaRepository;
    this.tenantRepository = tenantRepository;
  }

  public FormSchema getActiveSchema(String loanType) {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) {
      throw new IllegalStateException("Missing tenant context");
    }

    return formSchemaRepository.findByTenant_IdAndLoanTypeAndActiveIsTrue(tenantId, loanType)
        .orElseThrow(() -> new IllegalArgumentException("Active schema not found"));
  }

  public FormSchema updateSchema(String loanType, JsonNode schemaJson) {
    UUID tenantId = TenantContext.get();
    if (tenantId == null) {
      throw new IllegalStateException("Missing tenant context");
    }

    Tenant tenant = tenantRepository.findById(tenantId)
        .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

    FormSchema active = formSchemaRepository.findByTenant_IdAndLoanTypeAndActiveIsTrue(tenantId, loanType)
        .orElse(null);

    int newVersion = (active == null) ? 1 : active.getVersion() + 1;

    if (active != null) {
      active.setActive(false);
      formSchemaRepository.save(active);
    }

    FormSchema updated = new FormSchema();
    updated.setId(UUID.randomUUID());
    updated.setTenant(tenant);
    updated.setLoanType(loanType);
    updated.setVersion(newVersion);
    updated.setSchemaJson(schemaJson);
    updated.setActive(true);
    updated.setCreatedAt(OffsetDateTime.now());

    return formSchemaRepository.save(updated);
  }
}

