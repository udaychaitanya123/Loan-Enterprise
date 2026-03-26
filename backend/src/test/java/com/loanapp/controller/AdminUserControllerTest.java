package com.loanapp.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loanapp.config.TenantContext;
import com.loanapp.dto.CreateUserRequest;
import com.loanapp.dto.UserProfileDto;
import com.loanapp.service.UserService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AdminUserControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private UserService userService;

  @Autowired
  private ObjectMapper objectMapper;

  private UUID testTenantId;

  @BeforeEach
  void setUp() {
    testTenantId = UUID.randomUUID();
    TenantContext.set(testTenantId);
  }

  @AfterEach
  void tearDown() {
    TenantContext.clear();
  }

  @Test
  @WithMockUser(authorities = "TENANT_ADMIN")
  void listUsers_ShouldReturnSuccessfulResponse() throws Exception {
    UserProfileDto user = new UserProfileDto();
    user.setFullName("John Doe");
    user.setEmail("john@example.com");

    when(userService.listTenantUsers(testTenantId)).thenReturn(List.of(user));

    mockMvc.perform(get("/api/v1/admin/users"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].fullName").value("John Doe"))
        .andExpect(jsonPath("$[0].email").value("john@example.com"));
  }

  @Test
  @WithMockUser(authorities = "TENANT_ADMIN")
  void createUser_ShouldReturnCreatedStatus() throws Exception {
    CreateUserRequest request = new CreateUserRequest();
    request.setEmail("new@example.com");
    request.setFullName("New User");
    request.setRole("LOAN_OFFICER");
    request.setPassword("pass123");

    UserProfileDto response = new UserProfileDto();
    response.setEmail("new@example.com");
    response.setFullName("New User");

    when(userService.createUser(eq(testTenantId), any(), any(), any(), any())).thenReturn(response);

    mockMvc.perform(post("/api/v1/admin/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value("new@example.com"));
  }
}
