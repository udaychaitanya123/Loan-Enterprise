package com.loanapp.repository;

import com.loanapp.entity.WorkflowStep;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, UUID> {
  List<WorkflowStep> findByApplication_Id(UUID applicationId);

  Optional<WorkflowStep> findFirstByApplication_IdAndStatus(UUID applicationId, String status);
}

