import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoanApplicationService } from '../../core/services/loan-application.service';
import { LoanCalculatorComponent } from '../../shared/components/loan-calculator.component';

interface CountResponse { totalElements: number; content?: any[]; }

@Component({
  selector: 'app-applicant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoanCalculatorComponent],
  template: `
    <section class="py-8">
      <div class="flex flex-col gap-6">

        <!-- Header -->
        <div class="flex flex-col gap-2">
          <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
            <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
            <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">My Loans</span>
          </div>
          <h1 class="font-display text-3xl leading-[1.15] tracking-tight text-jet_black-500 sm:text-[3.25rem]">
            My Dashboard
          </h1>
          <p class="text-sm text-blue_slate-600">Welcome back, <span class="font-medium text-jet_black-500">{{ user()?.fullName }}</span></p>
        </div>

        <!-- My Application Summary -->
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="rounded-2xl border border-silver-700 bg-white p-6 shadow-card-md hover:shadow-card-xl transition-all duration-300">
            <div class="text-xs text-blue_slate-600 uppercase tracking-wider">Total Submitted</div>
            <div class="mt-3 text-3xl font-semibold tracking-tight text-jet_black-500">{{ total() }}</div>
          </div>
          <div class="rounded-2xl border border-silver-700 bg-white p-6 shadow-card-md hover:shadow-card-xl transition-all duration-300">
            <div class="text-xs text-blue_slate-600 uppercase tracking-wider">Pending Review</div>
            <div class="mt-3 text-3xl font-semibold tracking-tight text-coral_glow-500">{{ pending() }}</div>
          </div>
          <div class="rounded-2xl border border-silver-700 bg-white p-6 shadow-card-md hover:shadow-card-xl transition-all duration-300">
            <div class="text-xs text-blue_slate-600 uppercase tracking-wider">Approved</div>
            <div class="mt-3 text-3xl font-semibold tracking-tight text-green-600">{{ approved() }}</div>
          </div>
          <div class="rounded-2xl border border-silver-700 bg-white p-6 shadow-card-md hover:shadow-card-xl transition-all duration-300">
            <div class="text-xs text-blue_slate-600 uppercase tracking-wider">Rejected</div>
            <div class="mt-3 text-3xl font-semibold tracking-tight text-jet_black-500">{{ rejected() }}</div>
          </div>
        </div>

        <!-- Recent Applications -->
        <div class="rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-jet_black-500">Recent Applications</h2>
            <a routerLink="/loans" class="text-sm text-coral_glow-500 hover:underline">View all →</a>
          </div>
          <div *ngIf="recentApps().length === 0" class="text-sm text-blue_slate-600 py-4 text-center">No applications yet.</div>
          <div *ngFor="let app of recentApps()" class="flex items-center justify-between py-3 border-b border-silver-700 last:border-0">
            <div>
              <span class="text-sm font-medium text-jet_black-500">{{ app.referenceNumber }}</span>
              <span class="ml-2 text-xs text-blue_slate-600">{{ app.loanType }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-jet_black-500">{{ formatCurrency(app.amount) }}</span>
              <a [routerLink]="['/loans', app.id]"
                class="text-xs text-coral_glow-500 hover:underline border border-coral_glow-500/30 px-2 py-1 rounded-lg">
                {{ app.status }}
              </a>
            </div>
          </div>
        </div>

        <!-- EMI Calculator Sidebar Widget -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 flex flex-col gap-4">
            <div class="rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md">
              <h2 class="text-base font-semibold text-jet_black-500 mb-4">Quick Actions</h2>
              <a routerLink="/loans/new"
                class="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-coral_glow-400 to-coral_glow-500 text-white font-body font-medium shadow-card hover:-translate-y-0.5 hover:shadow-accent hover:brightness-110 active:scale-[0.98] transition-all duration-200">
                + New Application
              </a>
            </div>
          </div>
          <div>
            <app-loan-calculator [defaultRate]="12.5"></app-loan-calculator>
          </div>
        </div>

      </div>
    </section>
  `
})
export class ApplicantDashboardComponent implements OnInit {
  total = signal(0);
  pending = signal(0);
  approved = signal(0);
  rejected = signal(0);
  recentApps = signal<any[]>([]);
  readonly user = signal<any>(null);

  constructor(public auth: AuthService, private loans: LoanApplicationService) {}

  ngOnInit(): void {
    this.user.set(this.auth.getUser());
    this.loadStats();
  }

  private loadStats(): void {
    forkJoin({
      total: this.loans.getApplications({ page: 0, size: 5 }).pipe(catchError(() => of<CountResponse>({ totalElements: 0, content: [] }))),
      pending: this.loans.getApplications({ status: 'PENDING_REVIEW', page: 0, size: 1 }).pipe(catchError(() => of<CountResponse>({ totalElements: 0 }))),
      approved: this.loans.getApplications({ status: 'APPROVED', page: 0, size: 1 }).pipe(catchError(() => of<CountResponse>({ totalElements: 0 }))),
      rejected: this.loans.getApplications({ status: 'REJECTED', page: 0, size: 1 }).pipe(catchError(() => of<CountResponse>({ totalElements: 0 })))
    }).subscribe(res => {
      this.total.set(res.total.totalElements);
      this.pending.set(res.pending.totalElements);
      this.approved.set(res.approved.totalElements);
      this.rejected.set(res.rejected.totalElements);
      this.recentApps.set((res.total as any).content?.slice(0, 5) || []);
    });
  }

  formatCurrency(v: number): string {
    if (!v) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }
}
