import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshInProgress = false;
  private refreshToken$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getAccessToken();
    const shouldSkipAuthHeader = req.url.includes('/api/v1/auth/login') || req.url.includes('/api/v1/auth/refresh');

    const authReq = !shouldSkipAuthHeader && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    const alreadyRetried = authReq.headers.has('X-Retry-Attempt');
    return next.handle(authReq).pipe(
      catchError((err: unknown) => {
        const httpErr = err as HttpErrorResponse;
        const isRefreshEndpoint = authReq.url.includes('/api/v1/auth/refresh');
        if (httpErr.status !== 401 || alreadyRetried || isRefreshEndpoint) {
          return throwError(() => err);
        }

        if (this.refreshInProgress) {
          return this.refreshToken$.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((newToken) => {
              const retryReq = authReq.clone({
                setHeaders: { Authorization: `Bearer ${newToken}`, 'X-Retry-Attempt': '1' }
              });
              return next.handle(retryReq);
            })
          );
        }

        this.refreshInProgress = true;
        this.refreshToken$.next(null);

        return this.auth.refresh().pipe(
          switchMap((res) => {
            this.refreshToken$.next(res.accessToken);
            const retryReq = authReq.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}`, 'X-Retry-Attempt': '1' }
            });
            return next.handle(retryReq);
          }),
          catchError((refreshErr) => {
            this.auth.logout();
            return throwError(() => refreshErr);
          }),
          finalize(() => {
            this.refreshInProgress = false;
          })
        );
      })
    );
  }
}

