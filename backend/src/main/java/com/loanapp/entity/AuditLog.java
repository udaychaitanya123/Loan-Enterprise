package com.loanapp.entity;

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
@Table(name = "audit_logs")
public class AuditLog {
  public AuditLog() {}

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tenant_id")
  private Tenant tenant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id")
  private User actor;

  @Column(name = "entity_type", nullable = false)
  private String entityType;

  @Column(name = "entity_id", nullable = false)
  private UUID entityId;

  @Column(name = "action", nullable = false)
  private String action;

  @Column(name = "delta_json", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode deltaJson;

  @Column(name = "occurred_at", nullable = false)
  private OffsetDateTime occurredAt;

  public UUID getId() {
    return id;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public User getActor() {
    return actor;
  }

  public String getEntityType() {
    return entityType;
  }

  public UUID getEntityId() {
    return entityId;
  }

  public String getAction() {
    return action;
  }

  public JsonNode getDeltaJson() {
    return deltaJson;
  }

  public OffsetDateTime getOccurredAt() {
    return occurredAt;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public void setTenant(Tenant tenant) {
    this.tenant = tenant;
  }

  public void setActor(User actor) {
    this.actor = actor;
  }

  public void setEntityType(String entityType) {
    this.entityType = entityType;
  }

  public void setEntityId(UUID entityId) {
    this.entityId = entityId;
  }

  public void setAction(String action) {
    this.action = action;
  }

  public void setDeltaJson(JsonNode deltaJson) {
    this.deltaJson = deltaJson;
  }

  public void setOccurredAt(OffsetDateTime occurredAt) {
    this.occurredAt = occurredAt;
  }
}

