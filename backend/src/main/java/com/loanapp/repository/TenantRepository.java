package com.loanapp.repository;

import com.loanapp.entity.Tenant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
  Optional<Tenant> findByDomainKey(String domainKey);
}

