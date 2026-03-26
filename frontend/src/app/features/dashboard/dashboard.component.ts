import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoanApplicationService } from '../../core/services/loan-application.service';
import { ApplicantDashboardComponent } from './applicant-dashboard.component';

interface CountResponse {
  totalElements: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ApplicantDashboardComponent],
  template: `
    <!-- Role-gated dashboard: APPLICANT sees their own view; officers/admins see the original -->
    @if (isApplicantOnly()) {
      <app-applicant-dashboard></app-applicant-dashboard>
    } @else {
      <section class="py-8">
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
              <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
              <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Overview</span>
            </div>

            <h1 class="font-display text-3xl leading-[1.15] tracking-tight text-jet_black-500 sm:text-[3.25rem]">
              Dashboard
            </h1>

            <div class="text-sm text-blue_slate-600" *ngIf="user() as u">
              <span class="font-medium text-jet_black-500">{{ u.fullName }}</span>
              <span class="mx-2 text-silver-500">/</span>
              <span>{{ u.tenantName }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div
              class="
                rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md
                hover:shadow-card-xl hover:bg-gradient-to-br hover:from-coral_glow-500/[0.03] hover:to-transparent
                transition-all duration-300
              "
            >
              <div class="text-sm text-blue_slate-600">Total applications</div>
              <div class="mt-3 text-3xl font-semibold tracking-tight text-jet_black-500">{{ total() }}</div>
            </div>
            <div
              class="
                rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md
                hover:shadow-card-xl hover:bg-gradient-to-br hover:from-coral_glow-500/[0.03] hover:to-transparent
                transition-all duration-300
              "
            >
              <div class="text-sm text-blue_slate-600">Pending review</div>
              <div class="mt-3 text-3xl font-semibold tracking-tight text-jet_black-500">{{ pending() }}</div>
            </div>
            <div
              class="
                rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md
                hover:shadow-card-xl hover:bg-gradient-to-br hover:from-coral_glow-500/[0.03] hover:to-transparent
                transition-all duration-300
              "
            >
              <div class="text-sm text-blue_slate-600">Approved</div>
              <div class="mt-3 text-3xl font-semibold tracking-tight text-jet_black-500">{{ approved() }}</div>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              routerLink="/loans"
              class="
                inline-flex items-center justify-center gap-2
                h-12 px-6 rounded-xl
                bg-gradient-to-r from-coral_glow-400 to-coral_glow-500
                text-white font-body font-medium
                shadow-card
                hover:-translate-y-0.5 hover:shadow-accent hover:brightness-110
                active:scale-[0.98]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
              "
            >
              View loans
            </a>

            <a
              *ngIf="auth.hasRole('APPLICANT')"
              routerLink="/loans/new"
              class="
                inline-flex items-center justify-center gap-2
                h-12 px-6 rounded-xl
                border border-silver-700
                text-jet_black-500 font-body font-medium bg-white
                hover:bg-silver-900 hover:border-coral_glow-500/30 hover:shadow-card
                active:scale-[0.98]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
              "
            >
              New application
            </a>
          </div>
        </div>
      </section>
    }
  `
})
export class DashboardComponent {
  loading = signal(false);
  total = signal(0);
  pending = signal(0);
  approved = signal(0);
  readonly user = computed(() => this.auth.getUser());

  readonly isApplicantOnly = computed(() =>
    this.auth.hasRole('APPLICANT') && !this.auth.hasRole('LOAN_OFFICER', 'FINANCE_OFFICER', 'TENANT_ADMIN')
  );

  constructor(public auth: AuthService, private loans: LoanApplicationService) {
    if (!this.isApplicantOnly()) {
      this.load();
    }
  }

  private load(): void {
    this.loading.set(true);
    forkJoin({
      total: this.loans.getApplications({ page: 0, size: 1 }).pipe(
        catchError(() => of<CountResponse>({ totalElements: 0 }))
      ),
      pending: this.loans.getApplications({ status: 'PENDING_REVIEW', page: 0, size: 1 }).pipe(
        catchError(() => of<CountResponse>({ totalElements: 0 }))
      ),
      approved: this.loans.getApplications({ status: 'APPROVED', page: 0, size: 1 }).pipe(
        catchError(() => of<CountResponse>({ totalElements: 0 }))
      )
    }).subscribe((res) => {
      this.total.set(res.total.totalElements);
      this.pending.set(res.pending.totalElements);
      this.approved.set(res.approved.totalElements);
      this.loading.set(false);
    });
  }
}
