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
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "loan_applications")
public class LoanApplication {
  public LoanApplication() {}

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tenant_id")
  @JsonIgnore
  private Tenant tenant;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "applicant_id")
  @JsonIgnore
  private User applicant;

  @Column(name = "reference_number", nullable = false)
  private String referenceNumber;

  @Column(name = "loan_type", nullable = false)
  private String loanType;

  private BigDecimal amount;

  private String status;

  @Column(name = "form_schema_version", nullable = false)
  private int formSchemaVersion;

  @Column(name = "form_data", columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode formData;

  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  @Column(name = "updated_at")
  private OffsetDateTime updatedAt;

  @Column(name = "disbursed_at")
  private OffsetDateTime disbursedAt;

  @Column(name = "disbursement_amount")
  private BigDecimal disbursementAmount;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getReferenceNumber() {
    return referenceNumber;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public User getApplicant() {
    return applicant;
  }

  public String getLoanType() {
    return loanType;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public String getStatus() {
    return status;
  }

  public int getFormSchemaVersion() {
    return formSchemaVersion;
  }

  public JsonNode getFormData() {
    return formData;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public void setTenant(Tenant tenant) {
    this.tenant = tenant;
  }

  public void setApplicant(User applicant) {
    this.applicant = applicant;
  }

  public void setReferenceNumber(String referenceNumber) {
    this.referenceNumber = referenceNumber;
  }

  public void setLoanType(String loanType) {
    this.loanType = loanType;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public void setFormSchemaVersion(int formSchemaVersion) {
    this.formSchemaVersion = formSchemaVersion;
  }

  public void setFormData(JsonNode formData) {
    this.formData = formData;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public OffsetDateTime getDisbursedAt() {
    return disbursedAt;
  }

  public void setDisbursedAt(OffsetDateTime disbursedAt) {
    this.disbursedAt = disbursedAt;
  }

  public BigDecimal getDisbursementAmount() {
    return disbursementAmount;
  }

  public void setDisbursementAmount(BigDecimal disbursementAmount) {
    this.disbursementAmount = disbursementAmount;
  }
}

