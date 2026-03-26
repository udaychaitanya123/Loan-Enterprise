import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SignupRequest {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  password: string;
  tenantDomainKey: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  tenantName: string;
  roles: string[];
  status: string;
}

export interface TenantPublic {
  domainKey: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  signup(req: SignupRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>('/api/v1/auth/signup', req);
  }

  getPublicTenants(): Observable<TenantPublic[]> {
    return this.http.get<TenantPublic[]>('/api/v1/public/tenants');
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/v1/users/me');
  }

  updateMyProfile(data: { fullName?: string; mobileNumber?: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>('/api/v1/users/me', data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>('/api/v1/users/me/password', { currentPassword, newPassword });
  }

  listUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>('/api/v1/admin/users');
  }

  updateUserRoles(userId: string, roles: string[]): Observable<UserProfile> {
    return this.http.put<UserProfile>(`/api/v1/admin/users/${userId}/roles`, { roles });
  }

  updateUserStatus(userId: string, status: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`/api/v1/admin/users/${userId}/status`, { status });
  }
}
