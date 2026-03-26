package com.loanapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "form_schemas")
public class FormSchema {
  public FormSchema() {}

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tenant_id")
  @JsonIgnore
  private Tenant tenant;

  @Column(name = "loan_type", nullable = false)
  private String loanType;

  private int version;

  @Column(name = "schema_json", columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode schemaJson;

  private boolean active;

  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  public UUID getId() {
    return id;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public String getLoanType() {
    return loanType;
  }

  public int getVersion() {
    return version;
  }

  public JsonNode getSchemaJson() {
    return schemaJson;
  }

  public boolean isActive() {
    return active;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public void setTenant(Tenant tenant) {
    this.tenant = tenant;
  }

  public void setLoanType(String loanType) {
    this.loanType = loanType;
  }

  public void setVersion(int version) {
    this.version = version;
  }

  public void setSchemaJson(JsonNode schemaJson) {
    this.schemaJson = schemaJson;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}

