import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { UserService, TenantPublic } from '../../../core/services/user.service';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const dob = new Date(control.value);
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  return dob <= eighteenYearsAgo ? null : { minAge: true };
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="py-10 lg:py-16">
      <div class="mx-auto max-w-xl">
        <div class="inline-flex items-center gap-3 rounded-full border border-coral_glow-500/30 bg-coral_glow-500/5 px-5 py-2">
          <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
          <span class="font-mono text-xs uppercase tracking-[0.15em] text-coral_glow-400">Join Today</span>
        </div>

        <h1 class="mt-6 font-display text-[2.75rem] leading-[1.05] tracking-tight text-jet_black-500">
          Create your <span class="gradient-text">account</span>
        </h1>
        <p class="mt-3 text-sm text-blue_slate-600">
          Already have an account?
          <a routerLink="/login" class="text-coral_glow-500 hover:underline font-medium">Sign in</a>
        </p>

        <div class="mt-8 rounded-2xl border border-silver-700 bg-white p-8 shadow-card-md">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <div>
              <label for="su-fullName" class="block text-sm font-medium text-jet_black-500">Full Name</label>
              <input id="su-fullName" type="text" formControlName="fullName"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 placeholder:text-blue_slate-600/50 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200"
                placeholder="Jane Doe" />
              <span *ngIf="form.get('fullName')?.invalid && form.get('fullName')?.touched" class="text-xs text-red-500 mt-1">Minimum 2 characters required.</span>
            </div>

            <div>
              <label for="su-email" class="block text-sm font-medium text-jet_black-500">Email Address</label>
              <input id="su-email" type="email" formControlName="email"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 placeholder:text-blue_slate-600/50 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200"
                placeholder="jane@company.com" autocomplete="email" />
              <span *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-xs text-red-500 mt-1">Valid email required.</span>
            </div>

            <div>
              <label for="su-mobile" class="block text-sm font-medium text-jet_black-500">Mobile Number</label>
              <input id="su-mobile" type="tel" formControlName="mobileNumber"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 placeholder:text-blue_slate-600/50 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200"
                placeholder="+1-555-555-5555" />
              <span *ngIf="form.get('mobileNumber')?.invalid && form.get('mobileNumber')?.touched" class="text-xs text-red-500 mt-1">Valid E.164 number required (e.g. +1-555-555-5555).</span>
            </div>

            <div>
              <label for="su-dob" class="block text-sm font-medium text-jet_black-500">Date of Birth</label>
              <input id="su-dob" type="date" formControlName="dateOfBirth"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200" />
              <span *ngIf="form.get('dateOfBirth')?.errors?.['minAge'] && form.get('dateOfBirth')?.touched" class="text-xs text-red-500 mt-1">Must be 18 or older.</span>
              <span *ngIf="form.get('dateOfBirth')?.errors?.['required'] && form.get('dateOfBirth')?.touched" class="text-xs text-red-500 mt-1">Date of birth required.</span>
            </div>

            <div>
              <label for="su-tenant" class="block text-sm font-medium text-jet_black-500">Bank / Tenant</label>
              <select id="su-tenant" formControlName="tenantDomainKey"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200">
                <option value="">Select your bank…</option>
                <option *ngFor="let t of tenants()" [value]="t.domainKey">{{ t.name }}</option>
              </select>
              <span *ngIf="form.get('tenantDomainKey')?.invalid && form.get('tenantDomainKey')?.touched" class="text-xs text-red-500 mt-1">Please select a tenant.</span>
            </div>

            <ng-container formGroupName="passwords">
              <div>
                <label for="su-password" class="block text-sm font-medium text-jet_black-500">Password</label>
                <input id="su-password" type="password" formControlName="password"
                  class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 placeholder:text-blue_slate-600/50 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200"
                  placeholder="Min 8 chars, uppercase, number, special" autocomplete="new-password" />
                <span *ngIf="form.get('passwords.password')?.invalid && form.get('passwords.password')?.touched" class="text-xs text-red-500 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special char.</span>
              </div>
              <div>
                <label for="su-confirm" class="block text-sm font-medium text-jet_black-500">Confirm Password</label>
                <input id="su-confirm" type="password" formControlName="confirmPassword"
                  class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 placeholder:text-blue_slate-600/50 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200"
                  placeholder="Repeat password" autocomplete="new-password" />
                <span *ngIf="form.get('passwords')?.errors?.['passwordMismatch'] && form.get('passwords.confirmPassword')?.touched" class="text-xs text-red-500 mt-1">Passwords do not match.</span>
              </div>
            </ng-container>

            <div *ngIf="error()" role="alert" class="rounded-xl border border-jet_black-300 bg-jet_black-100 px-4 py-3 text-sm text-silver-900">
              {{ error() }}
            </div>
            <div *ngIf="success()" role="alert" class="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
              Account created! <a routerLink="/login" class="underline font-medium">Sign in now →</a>
            </div>

            <button type="submit" [disabled]="loading()"
              class="inline-flex w-full items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-coral_glow-400 to-coral_glow-500 text-white font-body font-medium shadow-card hover:-translate-y-0.5 hover:shadow-accent hover:brightness-110 active:scale-[0.98] disabled:opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2">
              {{ loading() ? 'Creating account…' : 'Create account' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  `
})
export class SignupComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  tenants = signal<TenantPublic[]>([]);

  form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    mobileNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\+[1-9][0-9]*(-[0-9]+)*$/)] }),
    dateOfBirth: new FormControl('', { nonNullable: true, validators: [Validators.required, futureDateValidator] }),
    tenantDomainKey: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    passwords: new FormGroup({
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    }, { validators: passwordMatchValidator })
  });

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getPublicTenants().subscribe(t => this.tenants.set(t));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    this.userService.signup({
      fullName: v.fullName,
      email: v.email,
      mobileNumber: v.mobileNumber,
      dateOfBirth: v.dateOfBirth,
      password: (v.passwords as any).password,
      tenantDomainKey: v.tenantDomainKey
    }).pipe(catchError(err => {
      this.error.set(err?.error || 'Signup failed. Please try again.');
      this.loading.set(false);
      return of(null);
    })).subscribe(res => {
      this.loading.set(false);
      if (res) this.success.set(true);
    });
  }
}
