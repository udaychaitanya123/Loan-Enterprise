package com.loanapp.repository;

import com.loanapp.entity.FormSchema;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormSchemaRepository extends JpaRepository<FormSchema, UUID> {

  Optional<FormSchema> findByTenant_IdAndLoanTypeAndActiveIsTrue(UUID tenantId, String loanType);

  Optional<FormSchema> findTopByTenant_IdAndLoanTypeOrderByVersionDesc(UUID tenantId, String loanType);
}

