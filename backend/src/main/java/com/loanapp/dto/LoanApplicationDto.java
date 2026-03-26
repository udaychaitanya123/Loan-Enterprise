package com.loanapp.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class LoanApplicationDto {
  private UUID id;
  private String referenceNumber;
  private String loanType;
  private UUID applicantId;
  private BigDecimal amount;
  private String status;
  private int formSchemaVersion;
  private JsonNode formData;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;
  private List<WorkflowStepDto> workflowSteps;

  // Request payload fields (only some are populated depending on endpoint)
  private JsonNode requestFormData;
  private int schemaVersion;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getReferenceNumber() {
    return referenceNumber;
  }

  public void setReferenceNumber(String referenceNumber) {
    this.referenceNumber = referenceNumber;
  }

  public String getLoanType() {
    return loanType;
  }

  public void setLoanType(String loanType) {
    this.loanType = loanType;
  }

  public UUID getApplicantId() {
    return applicantId;
  }

  public void setApplicantId(UUID applicantId) {
    this.applicantId = applicantId;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public int getFormSchemaVersion() {
    return formSchemaVersion;
  }

  public void setFormSchemaVersion(int formSchemaVersion) {
    this.formSchemaVersion = formSchemaVersion;
  }

  public JsonNode getFormData() {
    return formData;
  }

  public void setFormData(JsonNode formData) {
    this.formData = formData;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public List<WorkflowStepDto> getWorkflowSteps() {
    return workflowSteps;
  }

  public void setWorkflowSteps(List<WorkflowStepDto> workflowSteps) {
    this.workflowSteps = workflowSteps;
  }

  public JsonNode getRequestFormData() {
    return requestFormData;
  }

  public void setRequestFormData(JsonNode requestFormData) {
    this.requestFormData = requestFormData;
  }

  public int getSchemaVersion() {
    return schemaVersion;
  }

  public void setSchemaVersion(int schemaVersion) {
    this.schemaVersion = schemaVersion;
  }

  public static class WorkflowStepDto {
    private String stepName;
    private String assignedRole;
    private String status;
    private UUID actorId;
    private String comments;
    private OffsetDateTime completedAt;

    public String getStepName() {
      return stepName;
    }

    public void setStepName(String stepName) {
      this.stepName = stepName;
    }

    public String getAssignedRole() {
      return assignedRole;
    }

    public void setAssignedRole(String assignedRole) {
      this.assignedRole = assignedRole;
    }

    public String getStatus() {
      return status;
    }

    public void setStatus(String status) {
      this.status = status;
    }

    public UUID getActorId() {
      return actorId;
    }

    public void setActorId(UUID actorId) {
      this.actorId = actorId;
    }

    public String getComments() {
      return comments;
    }

    public void setComments(String comments) {
      this.comments = comments;
    }

    public OffsetDateTime getCompletedAt() {
      return completedAt;
    }

    public void setCompletedAt(OffsetDateTime completedAt) {
      this.completedAt = completedAt;
    }
  }
}

