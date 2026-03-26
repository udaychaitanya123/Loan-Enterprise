import { Component, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { DynamicFormService } from '../../../core/services/dynamic-form.service';
import { LoanApplicationService } from '../../../core/services/loan-application.service';
import { DynamicFieldComponent } from '../../../shared/components/dynamic-field.component';
import { LoanApplication, FormSchema } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

type DecisionStatus = 'APPROVED' | 'REJECTED' | 'REFERRED';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule, DynamicFieldComponent, StatusBadgeComponent],
  template: `
    <section class="py-8">
      <div *ngIf="loan() && form() as g; else loadingTpl" class="space-y-7">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-4">
            <button
              type="button"
              (click)="router.navigate(['/loans'])"
              class="
                inline-flex items-center justify-center
                h-11 px-4 rounded-xl
                border border-silver-700 bg-white
                text-sm font-medium text-jet_black-500
                hover:bg-silver-900 hover:border-coral_glow-500/30 hover:shadow-card
                active:scale-[0.98]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
              "
            >
              Back
            </button>

            <div>
              <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
                <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
                <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Application</span>
              </div>
              <h1 class="mt-3 font-display text-2xl leading-[1.15] tracking-tight text-jet_black-500 sm:text-3xl">
                {{ loan()!.referenceNumber }}
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <app-status-badge [status]="loan()!.status" />
          </div>
        </div>

        <div
          *ngIf="error()"
          role="alert"
          class="rounded-xl border border-jet_black-300 bg-jet_black-100 px-4 py-3 text-sm text-silver-900"
        >
          {{ error() }}
        </div>

        <div class="rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold tracking-tight text-jet_black-500">Form</h2>
            <div class="text-sm text-blue_slate-600">Read-only</div>
          </div>
          <div class="mt-6 space-y-5">
            <app-dynamic-field *ngFor="let f of allFields()" [field]="f" [formGroup]="g" [readOnly]="true" />
          </div>
        </div>

        <div *ngIf="canReview()" class="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            (click)="openDecision('APPROVED')"
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
            Approve
          </button>
          <button
            type="button"
            (click)="openDecision('REFERRED')"
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
            Refer
          </button>
          <button
            type="button"
            (click)="openDecision('REJECTED')"
            class="
              inline-flex items-center justify-center gap-2
              h-12 px-6 rounded-xl
              border border-jet_black-300 bg-jet_black-100
              text-silver-900 font-body font-medium
              hover:brightness-110 hover:shadow-card
              active:scale-[0.98]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
            "
          >
            Reject
          </button>
        </div>

        <div *ngIf="decisionOpen()" class="fixed inset-0 z-40">
          <div class="absolute inset-0 bg-jet_black-100/80 backdrop-blur-sm" (click)="closeDecision()"></div>

          <div class="relative mx-auto mt-20 w-full max-w-xl px-6">
            <div class="rounded-2xl border border-silver-700 bg-white p-7 shadow-card-xl">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="inline-flex items-center gap-3 rounded-full border border-coral_glow-500/30 bg-coral_glow-500/5 px-5 py-2 w-fit">
                    <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
                    <span class="font-mono text-xs uppercase tracking-[0.15em] text-coral_glow-400">Decision</span>
                  </div>
                  <h2 class="mt-4 text-xl font-semibold tracking-tight text-jet_black-500">{{ decisionLabel() }}</h2>
                  <p class="mt-2 text-sm text-blue_slate-600">Comments are required.</p>
                </div>

                <button
                  type="button"
                  (click)="closeDecision()"
                  class="
                    inline-flex items-center justify-center
                    h-10 w-10 rounded-xl
                    border border-silver-700 bg-white
                    text-jet_black-500
                    hover:bg-silver-900 hover:border-coral_glow-500/30 hover:shadow-card
                    active:scale-[0.98]
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
                  "
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form [formGroup]="decisionForm" (ngSubmit)="confirmDecision()" class="mt-6 space-y-4">
                <div>
                  <label for="comments" class="block text-sm font-medium text-jet_black-500">Comments</label>
                  <textarea
                    id="comments"
                    formControlName="comments"
                    class="
                      mt-2 min-h-[120px] w-full rounded-xl
                      border border-silver-700 bg-transparent
                      px-4 py-3 font-body text-jet_black-500
                      placeholder:text-blue_slate-600/50
                      focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
                      transition-all duration-200
                    "
                    placeholder="Write a short decision note…"
                  ></textarea>
                </div>

                <div
                  *ngIf="decisionError()"
                  role="alert"
                  class="rounded-xl border border-jet_black-300 bg-jet_black-100 px-4 py-3 text-sm text-silver-900"
                >
                  {{ decisionError() }}
                </div>

                <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    (click)="closeDecision()"
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="loading()"
                    class="
                      inline-flex items-center justify-center gap-2
                      h-12 px-6 rounded-xl
                      bg-gradient-to-r from-coral_glow-400 to-coral_glow-500
                      text-white font-body font-medium
                      shadow-card
                      hover:-translate-y-0.5 hover:shadow-accent hover:brightness-110
                      active:scale-[0.98]
                      disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-card
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
                    "
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="rounded-2xl border border-silver-700 bg-white p-8 shadow-card-md text-sm text-blue_slate-600">
          Loading application…
        </div>
      </ng-template>
    </section>
  `
})
export class LoanDetailComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  loan = signal<LoanApplication | null>(null);
  schema = signal<FormSchema | null>(null);
  form = signal<FormGroup | null>(null);

  decisionStatus = signal<DecisionStatus | null>(null);
  decisionError = signal<string | null>(null);

  decisionForm = new FormGroup({
    comments: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(
    public auth: AuthService,
    private loans: LoanApplicationService,
    private dynamicForms: DynamicFormService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    void this.load();
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loans
      .getApplicationById(id)
      .pipe(
        tap((app) => this.loan.set(app)),
        switchMap((app) => this.loans.getSchema(app.loanType)),
        catchError(() => {
          this.error.set('Failed to load application.');
          return of(null);
        })
      )
      .subscribe((schemaRes) => {
        if (!schemaRes) return;
        const loanApp = this.loan();
        if (!loanApp) return;

        this.schema.set(schemaRes.schemaJson);
        const group = this.dynamicForms.buildFormGroup(schemaRes.schemaJson);
        const formData = (loanApp.formData ?? {}) as Record<string, unknown>;
        group.patchValue(formData);
        this.dynamicForms.applyConditionalLogic(schemaRes.schemaJson, group);
        this.form.set(group);
      });
  }

  allFields() {
    const s = this.schema();
    if (!s) return [];
    return s.steps.flatMap((st) => st.fields);
  }

  canReview(): boolean {
    return this.auth.hasRole('LOAN_OFFICER', 'TENANT_ADMIN');
  }

  openDecision(status: DecisionStatus): void {
    this.decisionStatus.set(status);
    this.decisionError.set(null);
    this.decisionForm.reset({ comments: '' });
  }

  closeDecision(): void {
    this.decisionStatus.set(null);
    this.decisionError.set(null);
  }

  decisionOpen(): boolean {
    return this.decisionStatus() !== null;
  }

  decisionLabel(): string {
    const s = this.decisionStatus();
    if (!s) return '';
    if (s === 'APPROVED') return 'Approve';
    if (s === 'REJECTED') return 'Reject';
    return 'Refer';
  }

  confirmDecision(): void {
    const status = this.decisionStatus();
    if (!status) return;

    if (this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      this.decisionError.set('Comments are required.');
      return;
    }

    const comments = this.decisionForm.getRawValue().comments;
    const appId = this.loan()?.id;
    if (!appId) return;

    this.loading.set(true);
    this.error.set(null);
    this.decisionError.set(null);

    this.loans
      .updateStatus(appId, { status, comments })
      .pipe(
        catchError(() => {
          this.decisionError.set('Failed to update status. Please try again.');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((updated) => {
        this.loading.set(false);
        if (!updated) return;
        this.loan.set(updated);
        this.closeDecision();
      });
  }
}

