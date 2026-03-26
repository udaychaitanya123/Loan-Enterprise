package com.loanapp.security;

import com.loanapp.config.TenantContext;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider jwtTokenProvider;

  public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
    this.jwtTokenProvider = jwtTokenProvider;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {
    try {
      String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring("Bearer ".length());
        if (jwtTokenProvider.validateToken(token)) {
          UUID userId = jwtTokenProvider.getUserId(token);
          UUID tenantId = jwtTokenProvider.getTenantId(token);
          List<String> roles = jwtTokenProvider.getRoles(token);

          TenantContext.set(tenantId);
          var authorities = roles.stream()
              .map(SimpleGrantedAuthority::new)
              .toList();

          var authentication = new UsernamePasswordAuthenticationToken(
              userId,
              null,
              authorities
          );
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      }
      filterChain.doFilter(request, response);
    } finally {
      TenantContext.clear();
    }
  }
}

