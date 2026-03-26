import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoanApplicationService } from '../../../core/services/loan-application.service';
import { LoanApplication } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

type StatusFilter = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFERRED' | 'DRAFT' | '';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <section class="py-8">
      <div class="flex items-start justify-between gap-6 flex-col lg:flex-row lg:items-center">
        <div>
          <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
            <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
            <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Applications</span>
          </div>
          <h1 class="mt-4 font-display text-3xl leading-[1.15] tracking-tight text-jet_black-500 sm:text-[3.25rem]">
            Loans
          </h1>
          <p class="mt-3 text-base leading-relaxed text-blue_slate-600">
            Filter, review, and open applications in a single place.
          </p>
        </div>

        <div class="w-full max-w-sm">
          <label class="block text-sm font-medium text-jet_black-500">
            Status
            <select
              class="
                mt-2 h-12 w-full rounded-xl
                border border-silver-700 bg-white
                px-4 text-jet_black-500
                focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
                transition-all duration-200
              "
              [value]="statusFilter()"
              (change)="onStatusChange($event)"
            >
              <option value="">All</option>
              <option value="PENDING_REVIEW">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REFERRED">Referred</option>
              <option value="DRAFT">Draft</option>
            </select>
          </label>
        </div>
      </div>

      <div
        *ngIf="error()"
        role="alert"
        class="mt-6 rounded-xl border border-jet_black-300 bg-jet_black-100 px-4 py-3 text-sm text-silver-900"
      >
        {{ error() }}
      </div>

      <div class="mt-8 rounded-2xl border border-silver-700 bg-white shadow-card-md overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.5fr] gap-3 px-6 py-4 bg-silver-900 border-b border-silver-700">
          <div class="text-xs font-mono uppercase tracking-[0.15em] text-blue_slate-600">Reference</div>
          <div class="text-xs font-mono uppercase tracking-[0.15em] text-blue_slate-600">Status</div>
          <div class="text-xs font-mono uppercase tracking-[0.15em] text-blue_slate-600">Amount</div>
          <div class="text-xs font-mono uppercase tracking-[0.15em] text-blue_slate-600 text-right">Action</div>
        </div>

        <div *ngIf="loading()" class="px-6 py-8 text-sm text-blue_slate-600">
          Loading…
        </div>

        <div *ngIf="!loading() && applications().length === 0" class="px-6 py-10 text-sm text-blue_slate-600">
          No applications found for this filter.
        </div>

        <div
          *ngFor="let app of applications()"
          class="
            grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.5fr] gap-3
            px-6 py-4 border-b border-silver-700/60
            hover:bg-silver-900/60 transition-colors
          "
        >
          <div class="text-sm font-medium text-jet_black-500">{{ app.referenceNumber }}</div>
          <div class="flex items-center"><app-status-badge [status]="app.status" /></div>
          <div class="text-sm text-blue_slate-600">{{ app.amount ?? '-' }}</div>
          <div class="flex justify-end">
            <button
              type="button"
              (click)="open(app.id)"
              class="
                inline-flex items-center gap-2
                h-11 px-4 rounded-xl
                border border-silver-700 bg-white
                text-sm font-medium text-jet_black-500
                hover:bg-silver-900 hover:border-coral_glow-500/30 hover:shadow-card
                active:scale-[0.98]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
              "
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class LoanListComponent {
  loading = signal(false);
  error = signal<string | null>(null);
  statusFilter = signal<StatusFilter>(''); // default: All
  applications = signal<LoanApplication[]>([]);

  constructor(
    private loans: LoanApplicationService,
    private router: Router,
    private auth: AuthService
  ) {
    // Default pending view for officers/admins.
    if (this.auth.hasRole('LOAN_OFFICER') || this.auth.hasRole('TENANT_ADMIN')) {
      this.statusFilter.set('PENDING_REVIEW');
    }
    this.load();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter.set(select.value as StatusFilter);
    this.load();
  }

  open(id: string): void {
    void this.router.navigate(['/loans', id]);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.statusFilter() || undefined;
    this.loans
      .getApplications({ status, page: 0, size: 50 })
      .pipe(
        catchError(() => of({ content: [], totalElements: 0, totalPages: 0, size: 50, number: 0 }))
      )
      .subscribe((page) => {
        this.applications.set(page.content);
        this.loading.set(false);
      });
  }
}

