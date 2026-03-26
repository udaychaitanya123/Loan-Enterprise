package com.loanapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.loanapp.dto.LoanApplicationDto;
import com.loanapp.entity.AuditLog;
import com.loanapp.entity.LoanApplication;
import com.loanapp.entity.Tenant;
import com.loanapp.entity.User;
import com.loanapp.entity.WorkflowStep;
import com.loanapp.repository.AuditLogRepository;
import com.loanapp.repository.FormSchemaRepository;
import com.loanapp.repository.LoanApplicationRepository;
import com.loanapp.repository.UserRepository;
import com.loanapp.repository.WorkflowStepRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoanApplicationService {

  private final LoanApplicationRepository loanApplicationRepository;
  private final WorkflowStepRepository workflowStepRepository;
  private final AuditLogRepository auditLogRepository;
  private final UserRepository userRepository;
  private final FormSchemaRepository formSchemaRepository;

  public LoanApplicationService(
      LoanApplicationRepository loanApplicationRepository,
      WorkflowStepRepository workflowStepRepository,
      AuditLogRepository auditLogRepository,
      UserRepository userRepository,
      FormSchemaRepository formSchemaRepository
  ) {
    this.loanApplicationRepository = loanApplicationRepository;
    this.workflowStepRepository = workflowStepRepository;
    this.auditLogRepository = auditLogRepository;
    this.userRepository = userRepository;
    this.formSchemaRepository = formSchemaRepository;
  }

  @Transactional(readOnly = true)
  public Page<LoanApplicationDto> listApplications(
      UUID tenantId,
      UUID principalUserId,
      boolean applicantOnly,
      String status,
      Pageable pageable
  ) {
    Page<LoanApplication> page;
    if (applicantOnly) {
      if (status == null) {
        page = loanApplicationRepository.findByTenant_IdAndApplicant_Id(tenantId, principalUserId, pageable);
      } else {
        page = loanApplicationRepository.findByTenant_IdAndStatusAndApplicant_Id(tenantId, status, principalUserId, pageable);
      }
    } else {
      if (status == null) {
        page = loanApplicationRepository.findByTenant_Id(tenantId, pageable);
      } else {
        page = loanApplicationRepository.findByTenant_IdAndStatus(tenantId, status, pageable);
      }
    }

    return page.map(this::toListDto);
  }

  @Transactional(readOnly = true)
  public LoanApplicationDto getApplicationById(
      UUID tenantId,
      UUID principalUserId,
      boolean applicantOnly,
      UUID applicationId
  ) {
    LoanApplication app;
    if (applicantOnly) {
      app = loanApplicationRepository.findByIdAndTenant_IdAndApplicant_Id(applicationId, tenantId, principalUserId)
          .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    } else {
      app = loanApplicationRepository.findByIdAndTenant_Id(applicationId, tenantId)
          .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    }

    return toDetailDto(app, fetchWorkflowSteps(app.getId()));
  }

  @Transactional
  public LoanApplicationDto createApplication(
      UUID tenantId,
      UUID applicantId,
      String loanType,
      JsonNode formData,
      int schemaVersion,
      boolean draft
  ) {
    User applicant = userRepository.findById(applicantId)
        .orElseThrow(() -> new IllegalArgumentException("Applicant not found"));

    if (!applicant.getTenant().getId().equals(tenantId)) {
      throw new IllegalArgumentException("Applicant not in tenant");
    }

    Tenant tenant = applicant.getTenant();

    String reference = generateReferenceNumber();
    LoanApplication app = new LoanApplication();
    app.setId(UUID.randomUUID());
    app.setTenant(tenant);
    app.setApplicant(applicant);
    app.setReferenceNumber(reference);
    app.setLoanType(loanType);
    app.setAmount(extractAmount(formData));
    app.setStatus(draft ? "DRAFT" : "PENDING_REVIEW");
    app.setFormSchemaVersion(schemaVersion);
    app.setFormData(formData);
    app.setCreatedAt(OffsetDateTime.now());
    app.setUpdatedAt(OffsetDateTime.now());

    LoanApplication saved = loanApplicationRepository.save(app);

    if (!draft) {
      WorkflowStep step = new WorkflowStep();
      step.setId(UUID.randomUUID());
      step.setApplication(saved);
      step.setStepName("Review");
      step.setAssignedRole("LOAN_OFFICER");
      step.setStatus("PENDING");
      step.setActor(null);
      step.setComments(null);
      step.setCompletedAt(null);
      workflowStepRepository.save(step);
    }

    AuditLog audit = new AuditLog();
    audit.setId(UUID.randomUUID());
    audit.setTenant(tenant);
    audit.setActor(applicant);
    audit.setEntityType("LOAN_APPLICATION");
    audit.setEntityId(saved.getId());
    audit.setAction(draft ? "APPLICATION_DRAFT_CREATED" : "APPLICATION_SUBMITTED");
    audit.setDeltaJson(buildAuditDelta(formData, saved.getFormSchemaVersion()));
    audit.setOccurredAt(OffsetDateTime.now());
    auditLogRepository.save(audit);

    return toDetailDto(saved, fetchWorkflowSteps(saved.getId()));
  }

  @Transactional
  public LoanApplicationDto updateStatus(
      UUID tenantId,
      UUID actorId,
      UUID applicationId,
      String newStatus,
      String comments
  ) {
    LoanApplication app = loanApplicationRepository.findByIdAndTenant_Id(applicationId, tenantId)
        .orElseThrow(() -> new IllegalArgumentException("Application not found"));

    User actor = userRepository.findById(actorId)
        .orElseThrow(() -> new IllegalArgumentException("Actor not found"));

    app.setStatus(newStatus);
    app.setUpdatedAt(OffsetDateTime.now());
    loanApplicationRepository.save(app);

    // Mark the first pending workflow step as completed.
    WorkflowStep pendingStep = workflowStepRepository.findFirstByApplication_IdAndStatus(applicationId, "PENDING")
        .orElse(null);
    if (pendingStep != null) {
      pendingStep.setStatus("COMPLETED");
      pendingStep.setActor(actor);
      pendingStep.setComments(comments);
      pendingStep.setCompletedAt(OffsetDateTime.now());
      workflowStepRepository.save(pendingStep);
    } else {
      WorkflowStep step = new WorkflowStep();
      step.setId(UUID.randomUUID());
      step.setApplication(app);
      step.setStepName("Review");
      step.setAssignedRole("LOAN_OFFICER");
      step.setStatus("COMPLETED");
      step.setActor(actor);
      step.setComments(comments);
      step.setCompletedAt(OffsetDateTime.now());
      workflowStepRepository.save(step);
    }

    AuditLog audit = new AuditLog();
    audit.setId(UUID.randomUUID());
    audit.setTenant(app.getTenant());
    audit.setActor(actor);
    audit.setEntityType("LOAN_APPLICATION");
    audit.setEntityId(app.getId());
    audit.setAction("APPLICATION_STATUS_UPDATED");
    audit.setDeltaJson(buildStatusDelta(newStatus, comments));
    audit.setOccurredAt(OffsetDateTime.now());
    auditLogRepository.save(audit);

    return toDetailDto(app, fetchWorkflowSteps(app.getId()));
  }

  private LoanApplicationDto toListDto(LoanApplication app) {
    LoanApplicationDto dto = new LoanApplicationDto();
    dto.setId(app.getId());
    dto.setReferenceNumber(app.getReferenceNumber());
    dto.setLoanType(app.getLoanType());
    dto.setApplicantId(app.getApplicant().getId());
    dto.setAmount(app.getAmount());
    dto.setStatus(app.getStatus());
    dto.setFormSchemaVersion(app.getFormSchemaVersion());
    dto.setCreatedAt(app.getCreatedAt());
    dto.setUpdatedAt(app.getUpdatedAt());
    // List view does not need full form data or workflow steps.
    dto.setFormData(null);
    dto.setWorkflowSteps(null);
    return dto;
  }

  private LoanApplicationDto toDetailDto(LoanApplication app, List<WorkflowStep> steps) {
    LoanApplicationDto dto = toListDto(app);
    dto.setFormData(app.getFormData());

    List<LoanApplicationDto.WorkflowStepDto> stepDtos = new ArrayList<>();
    for (WorkflowStep step : steps) {
      LoanApplicationDto.WorkflowStepDto sd = new LoanApplicationDto.WorkflowStepDto();
      sd.setStepName(step.getStepName());
      sd.setAssignedRole(step.getAssignedRole());
      sd.setStatus(step.getStatus());
      sd.setActorId(step.getActor() != null ? step.getActor().getId() : null);
      sd.setComments(step.getComments());
      sd.setCompletedAt(step.getCompletedAt());
      stepDtos.add(sd);
    }
    dto.setWorkflowSteps(stepDtos);
    return dto;
  }

  private List<WorkflowStep> fetchWorkflowSteps(UUID applicationId) {
    return workflowStepRepository.findByApplication_Id(applicationId);
  }

  private String generateReferenceNumber() {
    // Unique enough for local demo, and constrained by a UNIQUE DB column.
    return "LN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
  }

  private BigDecimal extractAmount(JsonNode formData) {
    if (formData == null) {
      return null;
    }
    JsonNode amountNode = formData.get("loanAmount");
    if (amountNode == null || amountNode.isNull()) {
      return null;
    }
    if (amountNode.isNumber()) {
      return amountNode.decimalValue();
    }
    try {
      return new BigDecimal(amountNode.asText());
    } catch (Exception e) {
      return null;
    }
  }

  private ObjectNode buildAuditDelta(JsonNode formData, int schemaVersion) {
    ObjectNode delta = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();
    delta.set("schemaVersion", com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.numberNode(schemaVersion));
    delta.set("formData", formData != null ? formData : com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode());
    return delta;
  }

  private ObjectNode buildStatusDelta(String newStatus, String comments) {
    ObjectNode delta = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();
    delta.put("status", newStatus);
    delta.put("comments", comments);
    return delta;
  }
}

