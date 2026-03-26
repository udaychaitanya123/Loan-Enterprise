package com.loanapp.dto;

public class TenantPublicDto {
  private String domainKey;
  private String name;

  public TenantPublicDto(String domainKey, String name) {
    this.domainKey = domainKey;
    this.name = name;
  }

  public String getDomainKey() {
    return domainKey;
  }

  public void setDomainKey(String domainKey) {
    this.domainKey = domainKey;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
