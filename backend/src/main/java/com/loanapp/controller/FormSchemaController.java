package com.loanapp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.loanapp.entity.FormSchema;
import com.loanapp.service.FormSchemaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/form-schemas")
public class FormSchemaController {

  private final FormSchemaService formSchemaService;

  public FormSchemaController(FormSchemaService formSchemaService) {
    this.formSchemaService = formSchemaService;
  }

  @GetMapping("/{loanType}")
  public FormSchema getActiveSchema(@PathVariable String loanType) {
    return formSchemaService.getActiveSchema(loanType);
  }

  @PutMapping("/{loanType}")
  @PreAuthorize("hasAuthority('TENANT_ADMIN')")
  public ResponseEntity<FormSchema> updateSchema(
      @PathVariable String loanType,
      @RequestBody JsonNode schemaJson
  ) {
    FormSchema updated = formSchemaService.updateSchema(loanType, schemaJson);
    return ResponseEntity.ok(updated);
  }
}

