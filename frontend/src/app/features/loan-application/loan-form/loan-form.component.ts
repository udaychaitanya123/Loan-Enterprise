import { Component, computed, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { DynamicFormService } from '../../../core/services/dynamic-form.service';
import { LoanApplicationService } from '../../../core/services/loan-application.service';
import { FormSchema } from '../../../core/models';
import { DynamicFieldComponent } from '../../../shared/components/dynamic-field.component';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule, DynamicFieldComponent],
  template: `
    <section class="py-8">
      <div *ngIf="schema() && form() as g; else loadingTpl" class="space-y-8">
        <div>
          <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
            <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
            <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">New application</span>
          </div>
          <h1 class="mt-4 font-display text-3xl leading-[1.15] tracking-tight text-jet_black-500 sm:text-[3.25rem]">
            Loan form
          </h1>
          <p class="mt-3 text-base leading-relaxed text-blue_slate-600">
            Complete the steps below. You’ll review everything before submitting.
          </p>
        </div>

        <div class="rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md">
          <div class="flex flex-wrap gap-2">
            <div
              class="rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.15em]"
              *ngFor="let s of (schema()?.steps ?? []); let i = index"
              [ngClass]="
                i === currentStep()
                  ? 'border-coral_glow-500/30 bg-coral_glow-500/5 text-coral_glow-400'
                  : 'border-silver-700 bg-white text-blue_slate-600'
              "
            >
              {{ i + 1 }}. {{ s.title }}
            </div>
            <div
              class="rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.15em]"
              [ngClass]="
                isReview()
                  ? 'border-coral_glow-500/30 bg-coral_glow-500/5 text-coral_glow-400'
                  : 'border-silver-700 bg-white text-blue_slate-600'
              "
            >
              Review
            </div>
          </div>

          <div
            *ngIf="error()"
            role="alert"
            class="mt-6 rounded-xl border border-jet_black-300 bg-jet_black-100 px-4 py-3 text-sm text-silver-900"
          >
            {{ error() }}
          </div>

          <ng-container *ngIf="!isReview(); else reviewTpl">
            <div class="mt-8">
              <h2 class="text-lg font-semibold tracking-tight text-jet_black-500">{{ currentStepTitle() }}</h2>
              <div class="mt-5 space-y-5">
                <app-dynamic-field *ngFor="let f of currentStepFields()" [field]="f" [formGroup]="g" />
              </div>
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                (click)="back()"
                [disabled]="currentStep() === 0"
                class="
                  inline-flex items-center justify-center gap-2
                  h-12 px-6 rounded-xl
                  border border-silver-700
                  text-jet_black-500 font-body font-medium bg-white
                  hover:bg-silver-900 hover:border-coral_glow-500/30 hover:shadow-card
                  disabled:opacity-60 disabled:hover:bg-white disabled:hover:shadow-none
                  active:scale-[0.98]
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
                "
              >
                Back
              </button>
              <button
                type="button"
                (click)="next()"
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
                Next
              </button>
            </div>
          </ng-container>

          <ng-template #reviewTpl>
            <div class="mt-8">
              <h2 class="text-lg font-semibold tracking-tight text-jet_black-500">Review</h2>
              <div class="mt-5 space-y-5">
                <app-dynamic-field *ngFor="let f of allFields()" [field]="f" [formGroup]="g" [readOnly]="true" />
              </div>
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                (click)="back()"
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
                Back
              </button>
              <button
                type="button"
                (click)="submit()"
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
                Submit
              </button>
            </div>
          </ng-template>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="rounded-2xl border border-silver-700 bg-white p-8 shadow-card-md text-sm text-blue_slate-600">
          Loading schema…
        </div>
      </ng-template>
    </section>
  `
})
export class LoanFormComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  schema = signal<FormSchema | null>(null);
  private schemaVersion = 1;

  form = signal<FormGroup | null>(null);

  currentStep = signal(0);

  readonly isReview = computed(() => {
    const s = this.schema();
    if (!s) return false;
    return this.currentStep() === s.steps.length;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    private dynamicForms: DynamicFormService,
    private loans: LoanApplicationService
  ) {
    void this.load();
  }

  private async load(): Promise<void> {
    const loanType = this.route.snapshot.queryParamMap.get('type') ?? 'PERSONAL_LOAN';
    this.loading.set(true);
    this.error.set(null);

    this.loans
      .getSchema(loanType)
      .pipe(
        catchError(() => {
          this.error.set('Failed to load form schema.');
          return of(null);
        })
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (!res) return;
        this.schemaVersion = res.version;
        this.schema.set(res.schemaJson);
        const group = this.dynamicForms.buildFormGroup(res.schemaJson);
        this.form.set(group);
        // Keep conditional fields in sync with the current form values.
        group.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
          this.dynamicForms.applyConditionalLogic(res.schemaJson, group);
        });
        this.currentStep.set(0);
      });
  }

  currentStepTitle(): string {
    const s = this.schema();
    if (!s) return '';
    return s.steps[this.currentStep()].title;
  }

  currentStepFields() {
    const s = this.schema();
    if (!s) return [];
    return s.steps[this.currentStep()].fields;
  }

  allFields() {
    const s = this.schema();
    if (!s) return [];
    return s.steps.flatMap((st) => st.fields);
  }

  private markStepTouched(): boolean {
    const s = this.schema();
    const g = this.form();
    if (!s || !g) return false;

    const fields = s.steps[this.currentStep()].fields;
    let ok = true;
    for (const f of fields) {
      const ctrl = g.get(f.key);
      if (!ctrl || ctrl.disabled) continue;
      ctrl.markAsTouched();
      if (ctrl.invalid) ok = false;
    }
    return ok;
  }

  next(): void {
    if (this.isReview()) return;
    const ok = this.markStepTouched();
    if (!ok) {
      this.error.set('Please fix validation errors before continuing.');
      return;
    }
    this.error.set(null);

    const s = this.schema();
    if (!s) return;
    if (this.currentStep() === s.steps.length - 1) {
      this.currentStep.set(s.steps.length);
    } else {
      this.currentStep.update((v) => v + 1);
    }
  }

  back(): void {
    if (this.currentStep() <= 0) return;
    this.currentStep.update((v) => v - 1);
    this.error.set(null);
  }

  submit(): void {
    const g = this.form();
    const s = this.schema();
    if (!g || !s) return;

    // Validate the whole form, including conditional states.
    this.error.set(null);
    g.markAllAsTouched();
    if (g.invalid) {
      this.error.set('Form is invalid. Please check required fields.');
      return;
    }

    this.loading.set(true);
    const loanType = (this.route.snapshot.queryParamMap.get('type') ?? 'PERSONAL_LOAN');
    const payload = {
      loanType,
      formData: this.dynamicForms.serializeFormGroup(g),
      schemaVersion: this.schemaVersion
    };

    this.loans
      .submitApplication(payload)
      .pipe(
        catchError(() => {
          this.error.set('Submission failed. Please try again.');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (!res) return;
        void this.router.navigate(['/loans']);
      });
  }
}

