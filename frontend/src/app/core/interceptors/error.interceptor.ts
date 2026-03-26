import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        const httpErr = err as HttpErrorResponse;
        if (httpErr.status === 403) {
          void this.router.navigate(['/dashboard'], { queryParams: { error: 'access_denied' } });
          return throwError(() => err);
        }

        if (httpErr.status === 500) {
          // Keep the message generic for users.
          this.snackBar.open('Something went wrong. Please try again.', 'Close', { duration: 6000 });
          // Minimal logging for diagnostics.
          console.error('API 500:', httpErr.message);
          return throwError(() => err);
        }

        return throwError(() => err);
      })
    );
  }
}

