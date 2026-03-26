import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { LoanApplicationService } from '../../core/services/loan-application.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-8">
      <div *ngIf="loanType(); else loadingTpl" class="space-y-6">
        <div>
          <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
            <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
            <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Admin</span>
          </div>
          <h1 class="mt-4 font-display text-3xl leading-[1.15] tracking-tight text-jet_black-500 sm:text-[3.25rem]">
            Form schema
          </h1>
          <p class="mt-3 text-base leading-relaxed text-blue_slate-600">
            Edit the raw JSON schema and save as a new active version.
          </p>
        </div>

        <div class="rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md space-y-5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-blue_slate-600">
              <span class="font-medium text-jet_black-500">Loan type:</span>
              <span class="ml-2">{{ loanType() }}</span>
            </div>
            <div class="text-sm text-blue_slate-600">
              <span class="font-medium text-jet_black-500">Version:</span>
              <span class="ml-2">{{ version() }}</span>
            </div>
          </div>

          <div
            *ngIf="error()"
            role="alert"
            class="rounded-xl border border-jet_black-300 bg-jet_black-100 px-4 py-3 text-sm text-silver-900"
          >
            {{ error() }}
          </div>

          <textarea
            class="
              w-full min-h-[460px] rounded-2xl
              border border-silver-700 bg-white
              px-5 py-4 font-mono text-xs text-jet_black-500
              focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
              transition-all duration-200
            "
            [value]="schemaText()"
            (input)="onSchemaInput($event)"
            spellcheck="false"
          ></textarea>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              (click)="save()"
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
              Save
            </button>
          </div>
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
export class AdminComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  loanType = signal<string | null>(null);
  version = signal<number>(0);
  schemaText = signal<string>('');

  constructor(private route: ActivatedRoute, private loans: LoanApplicationService) {
    void this.load();
  }

  onSchemaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    this.schemaText.set(target?.value ?? '');
  }

  private load(): void {
    const lt = this.route.snapshot.queryParamMap.get('loanType') ?? 'PERSONAL_LOAN';
    this.loanType.set(lt);
    this.error.set(null);

    this.loading.set(true);
    this.loans
      .getSchema(lt)
      .pipe(
        catchError(() => {
          this.error.set('Failed to load schema.');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (!res) return;
        this.version.set(res.version);
        this.schemaText.set(JSON.stringify(res.schemaJson, null, 2));
      });
  }

  save(): void {
    const lt = this.loanType();
    if (!lt) return;

    this.error.set(null);
    this.loading.set(true);

    let parsed: unknown;
    try {
      parsed = JSON.parse(this.schemaText());
    } catch {
      this.error.set('Schema JSON is not valid.');
      this.loading.set(false);
      return;
    }

    this.loans
      .updateSchema(lt, parsed)
      .pipe(
        catchError(() => {
          this.error.set('Failed to save schema.');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.version.set(res.version);
        this.schemaText.set(JSON.stringify(res.schemaJson, null, 2));
        this.loading.set(false);
      });
  }
}

