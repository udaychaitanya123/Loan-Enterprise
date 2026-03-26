import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="py-10 lg:py-20">
      <div class="mx-auto max-w-xl">
        <div class="inline-flex items-center gap-3 rounded-full border border-coral_glow-500/30 bg-coral_glow-500/5 px-5 py-2">
          <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
          <span class="font-mono text-xs uppercase tracking-[0.15em] text-coral_glow-400">Secure access</span>
        </div>

        <h1 class="mt-6 font-display text-[2.75rem] leading-[1.05] tracking-tight text-jet_black-500 sm:text-[3.5rem]">
          Sign in to
          <span class="gradient-text">Enterprise Loan</span>
        </h1>
        <p class="mt-4 text-base leading-relaxed text-blue_slate-600">
          Use your tenant credentials to access dashboards, review applications, and manage schemas.
        </p>
        <p class="mt-2 text-sm text-blue_slate-600">
          Don't have an account?
          <a routerLink="/signup" class="text-coral_glow-500 hover:underline font-medium">Sign up free →</a>
        </p>

        <div class="mt-8 rounded-2xl border border-silver-700 bg-white p-8 shadow-card-md">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-jet_black-500">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="
                  mt-2 h-12 w-full rounded-xl
                  border border-silver-700 bg-transparent
                  px-4 font-body text-jet_black-500
                  placeholder:text-blue_slate-600/50
                  focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
                  transition-all duration-200
                "
                placeholder="name@company.com"
                autocomplete="email"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-jet_black-500">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="
                  mt-2 h-12 w-full rounded-xl
                  border border-silver-700 bg-transparent
                  px-4 font-body text-jet_black-500
                  placeholder:text-blue_slate-600/50
                  focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
                  transition-all duration-200
                "
                placeholder="Your password"
                autocomplete="current-password"
              />
            </div>

            <div
              *ngIf="error()"
              role="alert"
              class="rounded-xl border border-jet_black-300 bg-jet_black-100 px-4 py-3 text-sm text-silver-900"
            >
              {{ error() }}
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="
                inline-flex w-full items-center justify-center gap-2
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
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    this.auth
      .login(email, password)
      .pipe(
        catchError((err) => {
          this.error.set('Login failed. Check your credentials.');
          return of(null);
        })
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (!res) return;
        void this.router.navigate(['/dashboard']);
      });
  }
}

