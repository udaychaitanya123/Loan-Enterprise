import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { FormSchemaResponse, LoanApplication, PageResponse, StatusUpdateRequest } from '../models';

interface SubmitApplicationRequest {
  loanType: string;
  formData: Record<string, unknown>;
  schemaVersion: number;
}

@Injectable({ providedIn: 'root' })
export class LoanApplicationService {
  constructor(private http: HttpClient) {}

  getSchema(loanType: string): Observable<FormSchemaResponse> {
    return this.http
      .get<FormSchemaResponse>(`/api/v1/form-schemas/${encodeURIComponent(loanType)}`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateSchema(loanType: string, schemaJson: unknown): Observable<FormSchemaResponse> {
    return this.http
      .put<FormSchemaResponse>(`/api/v1/form-schemas/${encodeURIComponent(loanType)}`, schemaJson)
      .pipe(catchError((err) => throwError(() => err)));
  }

  submitApplication(req: SubmitApplicationRequest): Observable<LoanApplication> {
    return this.http
      .post<LoanApplication>(`/api/v1/applications`, req)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveDraft(req: SubmitApplicationRequest): Observable<LoanApplication> {
    return this.http
      .post<LoanApplication>(`/api/v1/applications/draft`, req)
      .pipe(catchError((err) => throwError(() => err)));
  }

  getApplications(params: { status?: string; page?: number; size?: number } = {}): Observable<PageResponse<LoanApplication>> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    httpParams = httpParams.set('page', String(params.page ?? 0));
    httpParams = httpParams.set('size', String(params.size ?? 20));

    return this.http
      .get<PageResponse<LoanApplication>>(`/api/v1/applications`, { params: httpParams })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getApplicationById(id: string): Observable<LoanApplication> {
    return this.http
      .get<LoanApplication>(`/api/v1/applications/${encodeURIComponent(id)}`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateStatus(id: string, req: StatusUpdateRequest): Observable<LoanApplication> {
    return this.http
      .patch<LoanApplication>(`/api/v1/applications/${encodeURIComponent(id)}/status`, req)
      .pipe(catchError((err) => throwError(() => err)));
  }
}

