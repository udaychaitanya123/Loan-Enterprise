package com.loanapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.loanapp.dto.SignupRequest;
import com.loanapp.dto.UserProfileDto;
import com.loanapp.entity.Tenant;
import com.loanapp.entity.User;
import com.loanapp.repository.TenantRepository;
import com.loanapp.repository.UserRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private TenantRepository tenantRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @InjectMocks
  private UserService userService;

  private Tenant testTenant;

  @BeforeEach
  void setUp() {
    testTenant = new Tenant();
    testTenant.setId(UUID.randomUUID());
    testTenant.setDomainKey("alpha-bank");
    testTenant.setName("Alpha Bank");
  }

  @Test
  void signup_ShouldSucceed_WhenValidRequest() {
    // Arrange
    SignupRequest request = new SignupRequest();
    request.setFullName("John Doe");
    request.setEmail("john@example.com");
    request.setPassword("password123");
    request.setTenantDomainKey("alpha-bank");
    request.setDateOfBirth(LocalDate.now().minusYears(20));

    when(tenantRepository.findByDomainKey("alpha-bank")).thenReturn(Optional.of(testTenant));
    when(userRepository.findByEmailAndTenant_Id(request.getEmail(), testTenant.getId())).thenReturn(Optional.empty());
    when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedValue");
    when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

    // Act
    UserProfileDto result = userService.signup(request);

    // Assert
    assertNotNull(result);
    assertEquals("John Doe", result.getFullName());
    assertEquals("john@example.com", result.getEmail());
    assertEquals("ACTIVE", result.getStatus());
  }

  @Test
  void signup_ShouldThrowException_WhenUnder18() {
    // Arrange
    SignupRequest request = new SignupRequest();
    request.setFullName("John Doe");
    request.setTenantDomainKey("alpha-bank");
    request.setDateOfBirth(LocalDate.now().minusYears(17));

    when(tenantRepository.findByDomainKey("alpha-bank")).thenReturn(Optional.of(testTenant));

    // Act & Assert
    IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> userService.signup(request));
    assertEquals("Applicant must be at least 18 years old", ex.getMessage());
  }
}
