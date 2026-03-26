package com.loanapp.dto;

import java.time.LocalDate;

public class SignupRequest {
  private String fullName;
  private String email;
  private String mobileNumber;
  private LocalDate dateOfBirth;
  private String password;
  private String tenantDomainKey;

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getMobileNumber() {
    return mobileNumber;
  }

  public void setMobileNumber(String mobileNumber) {
    this.mobileNumber = mobileNumber;
  }

  public LocalDate getDateOfBirth() {
    return dateOfBirth;
  }

  public void setDateOfBirth(LocalDate dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getTenantDomainKey() {
    return tenantDomainKey;
  }

  public void setTenantDomainKey(String tenantDomainKey) {
    this.tenantDomainKey = tenantDomainKey;
  }
}
