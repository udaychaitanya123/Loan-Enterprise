package com.loanapp.repository;

import com.loanapp.entity.LoanApplication;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, UUID> {

  Page<LoanApplication> findByTenant_IdAndApplicant_Id(UUID tenantId, UUID applicantId, Pageable pageable);

  Page<LoanApplication> findByTenant_IdAndStatus(UUID tenantId, String status, Pageable pageable);

  Page<LoanApplication> findByTenant_IdAndStatusAndApplicant_Id(UUID tenantId, String status, UUID applicantId, Pageable pageable);

  Page<LoanApplication> findByTenant_Id(UUID tenantId, Pageable pageable);

  Optional<LoanApplication> findByIdAndTenant_Id(UUID id, UUID tenantId);

  Optional<LoanApplication> findByIdAndTenant_IdAndApplicant_Id(UUID id, UUID tenantId, UUID applicantId);
}

