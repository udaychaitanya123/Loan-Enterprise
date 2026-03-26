import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';

type Roles = string[];

interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  tenantName: string;
  roles: Roles;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';
  private readonly userKey = 'user';

  private readonly currentUser = signal<UserSummary | null>(this.readUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>('/api/v1/auth/login', body).pipe(
      map((res) => {
        this.setSession(res.accessToken, res.refreshToken, res.user);
        return res;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Missing refresh token'));
    }

    return this.http
      .post<AuthResponse>('/api/v1/auth/refresh', { refreshToken })
      .pipe(
        map((res) => {
          this.setSession(res.accessToken, res.refreshToken, res.user);
          return res;
        }),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  hasRole(...roles: Roles): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUser(): UserSummary | null {
    return this.currentUser();
  }

  private setSession(accessToken: string, refreshToken: string, user: UserSummary) {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readUser(): UserSummary | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSummary;
    } catch {
      return null;
    }
  }
}

