package com.loanapp.repository;

import com.loanapp.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmailAndTenant_Id(String email, UUID tenantId);

  Optional<User> findByEmail(String email);

  List<User> findAllByTenant_Id(UUID tenantId);
}

