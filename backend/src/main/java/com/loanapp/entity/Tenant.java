package com.loanapp.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "tenants")
public class Tenant {
  protected Tenant() {}

  @Id
  private UUID id;

  private String name;

  @Column(name = "domain_key")
  private String domainKey;

  @Column(name = "config_json", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode configJson;

  private String status;

  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  @Column(name = "updated_at")
  private OffsetDateTime updatedAt;

  public UUID getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getDomainKey() {
    return domainKey;
  }

  public JsonNode getConfigJson() {
    return configJson;
  }

  public String getStatus() {
    return status;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }
}

