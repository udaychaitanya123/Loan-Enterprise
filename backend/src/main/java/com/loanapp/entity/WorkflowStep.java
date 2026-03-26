package com.loanapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_steps")
public class WorkflowStep {
  public WorkflowStep() {}

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "application_id")
  @JsonIgnore
  private LoanApplication application;

  @Column(name = "step_name", nullable = false)
  private String stepName;

  @Column(name = "assigned_role", nullable = false)
  private String assignedRole;

  private String status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id")
  private User actor;

  private String comments;

  @Column(name = "completed_at")
  private OffsetDateTime completedAt;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public LoanApplication getApplication() {
    return application;
  }

  public String getStepName() {
    return stepName;
  }

  public String getAssignedRole() {
    return assignedRole;
  }

  public String getStatus() {
    return status;
  }

  public User getActor() {
    return actor;
  }

  public String getComments() {
    return comments;
  }

  public OffsetDateTime getCompletedAt() {
    return completedAt;
  }

  public void setApplication(LoanApplication application) {
    this.application = application;
  }

  public void setStepName(String stepName) {
    this.stepName = stepName;
  }

  public void setAssignedRole(String assignedRole) {
    this.assignedRole = assignedRole;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public void setActor(User actor) {
    this.actor = actor;
  }

  public void setComments(String comments) {
    this.comments = comments;
  }

  public void setCompletedAt(OffsetDateTime completedAt) {
    this.completedAt = completedAt;
  }
}

