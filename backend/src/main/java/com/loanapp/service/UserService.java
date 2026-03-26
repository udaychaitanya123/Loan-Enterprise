package com.loanapp.service;

import com.loanapp.dto.PasswordChangeRequest;
import com.loanapp.dto.ProfileUpdateRequest;
import com.loanapp.dto.RoleUpdateRequest;
import com.loanapp.dto.SignupRequest;
import com.loanapp.dto.UserProfileDto;
import com.loanapp.entity.Tenant;
import com.loanapp.entity.User;
import com.loanapp.repository.TenantRepository;
import com.loanapp.repository.UserRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(
      UserRepository userRepository,
      TenantRepository tenantRepository,
      PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.tenantRepository = tenantRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public UserProfileDto signup(SignupRequest request) {
    Tenant tenant = tenantRepository.findByDomainKey(request.getTenantDomainKey())
        .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

    // Email uniqueness within tenant
    userRepository.findByEmailAndTenant_Id(request.getEmail(), tenant.getId())
        .ifPresent(u -> { throw new IllegalArgumentException("Email already registered for this tenant"); });

    // Age check: must be 18+
    LocalDate dob = request.getDateOfBirth();
    if (dob == null || dob.isAfter(LocalDate.now().minusYears(18))) {
      throw new IllegalArgumentException("Applicant must be at least 18 years old");
    }

    User user = new User();
    user.setId(UUID.randomUUID());
    user.setTenant(tenant);
    user.setEmail(request.getEmail());
    user.setFullName(request.getFullName());
    user.setMobileNumber(request.getMobileNumber());
    user.setDateOfBirth(dob);
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setStatus("ACTIVE");
    user.setRoles(new HashSet<>(Set.of("APPLICANT")));
    user.setCreatedAt(OffsetDateTime.now());
    user.setUpdatedAt(OffsetDateTime.now());

    User saved = userRepository.save(user);
    return toProfileDto(saved);
  }

  @Transactional(readOnly = true)
  public UserProfileDto getProfile(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    return toProfileDto(user);
  }

  @Transactional
  public UserProfileDto updateProfile(UUID userId, ProfileUpdateRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    if (request.getFullName() != null && !request.getFullName().isBlank()) {
      user.setFullName(request.getFullName());
    }
    if (request.getMobileNumber() != null) {
      user.setMobileNumber(request.getMobileNumber());
    }
    user.setProfileUpdatedAt(OffsetDateTime.now());
    user.setUpdatedAt(OffsetDateTime.now());

    return toProfileDto(userRepository.save(user));
  }

  @Transactional
  public void changePassword(UUID userId, PasswordChangeRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Current password is incorrect");
    }

    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    user.setProfileUpdatedAt(OffsetDateTime.now());
    user.setUpdatedAt(OffsetDateTime.now());
    userRepository.save(user);
  }

  @Transactional(readOnly = true)
  public List<UserProfileDto> listTenantUsers(UUID tenantId) {
    return userRepository.findAllByTenant_Id(tenantId).stream()
        .map(this::toProfileDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public UserProfileDto getTenantUser(UUID tenantId, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    if (!user.getTenant().getId().equals(tenantId)) {
      throw new IllegalArgumentException("User not in tenant");
    }
    return toProfileDto(user);
  }

  @Transactional
  public UserProfileDto updateRoles(UUID tenantId, UUID actorId, UUID targetUserId, RoleUpdateRequest request) {
    User target = userRepository.findById(targetUserId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    if (!target.getTenant().getId().equals(tenantId)) {
      throw new IllegalArgumentException("User not in tenant");
    }

    Set<String> newRoles = request.getRoles() != null ? new HashSet<>(request.getRoles()) : new HashSet<>();

    // Guard: prevent self-demotion if sole TENANT_ADMIN
    if (actorId.equals(targetUserId) && !newRoles.contains("TENANT_ADMIN")) {
      long adminCount = userRepository.findAllByTenant_Id(tenantId).stream()
          .filter(u -> u.getRoles().contains("TENANT_ADMIN")).count();
      if (adminCount <= 1) {
        throw new IllegalArgumentException("Cannot remove TENANT_ADMIN role: you are the only admin in this tenant");
      }
    }

    target.setRoles(newRoles);
    target.setUpdatedAt(OffsetDateTime.now());
    return toProfileDto(userRepository.save(target));
  }

  @Transactional
  public UserProfileDto updateStatus(UUID tenantId, UUID targetUserId, String status) {
    User target = userRepository.findById(targetUserId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    if (!target.getTenant().getId().equals(tenantId)) {
      throw new IllegalArgumentException("User not in tenant");
    }
    target.setStatus(status);
    target.setUpdatedAt(OffsetDateTime.now());
    return toProfileDto(userRepository.save(target));
  }

  @Transactional
  public UserProfileDto createUser(UUID tenantId, String email, String fullName, String password, String role) {
    Tenant tenant = tenantRepository.findById(tenantId)
        .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

    // Check email uniqueness within tenant
    userRepository.findByEmailAndTenant_Id(email, tenantId)
        .ifPresent(u -> { throw new IllegalArgumentException("Email already exists in this tenant"); });

    User user = new User();
    user.setId(UUID.randomUUID());
    user.setTenant(tenant);
    user.setEmail(email);
    user.setFullName(fullName);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setStatus("ACTIVE");
    user.setRoles(new HashSet<>(Set.of(role)));
    user.setCreatedAt(OffsetDateTime.now());
    user.setUpdatedAt(OffsetDateTime.now());

    return toProfileDto(userRepository.save(user));
  }

  private UserProfileDto toProfileDto(User user) {
    UserProfileDto dto = new UserProfileDto();
    dto.setId(user.getId());
    dto.setEmail(user.getEmail());
    dto.setFullName(user.getFullName());
    dto.setMobileNumber(user.getMobileNumber());
    dto.setDateOfBirth(user.getDateOfBirth());
    dto.setTenantName(user.getTenant().getName());
    dto.setRoles(user.getRoles());
    dto.setStatus(user.getStatus());
    return dto;
  }
}
