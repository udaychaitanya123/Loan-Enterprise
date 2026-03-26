import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../../core/services/user.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="py-8">
      <div class="flex flex-col gap-6 max-w-2xl">
        <div>
          <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
            <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
            <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">My Account</span>
          </div>
          <h1 class="mt-4 font-display text-3xl tracking-tight text-jet_black-500">Profile Settings</h1>
        </div>

        <div *ngIf="profile() as p" class="rounded-2xl border border-silver-700 bg-white p-8 shadow-card-md space-y-6">
          <h2 class="text-lg font-semibold text-jet_black-500">Personal Information</h2>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="pf-fullName" class="block text-sm font-medium text-jet_black-500">Full Name</label>
                <input id="pf-fullName" type="text" formControlName="fullName"
                  class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200" />
              </div>
              <div>
                <label for="pf-mobile" class="block text-sm font-medium text-jet_black-500">Mobile Number</label>
                <input id="pf-mobile" type="tel" formControlName="mobileNumber"
                  class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200" />
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-blue_slate-600">Email (read-only)</label>
                <div class="mt-2 h-12 flex items-center px-4 rounded-xl border border-silver-700 bg-silver-900 text-blue_slate-600 text-sm">{{ p.email }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-blue_slate-600">Date of Birth (read-only)</label>
                <div class="mt-2 h-12 flex items-center px-4 rounded-xl border border-silver-700 bg-silver-900 text-blue_slate-600 text-sm">{{ p.dateOfBirth || '—' }}</div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-blue_slate-600">Tenant (read-only)</label>
              <div class="mt-2 h-12 flex items-center px-4 rounded-xl border border-silver-700 bg-silver-900 text-blue_slate-600 text-sm">{{ p.tenantName }}</div>
            </div>
            <div *ngIf="profileSuccess()" class="text-sm text-green-700 font-medium">Profile updated successfully.</div>
            <div *ngIf="profileError()" class="text-sm text-red-600">{{ profileError() }}</div>
            <button type="submit" [disabled]="profileSaving()"
              class="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-gradient-to-r from-coral_glow-400 to-coral_glow-500 text-white font-body font-medium shadow-card hover:-translate-y-0.5 hover:shadow-accent hover:brightness-110 active:scale-[0.98] disabled:opacity-70 transition-all duration-200">
              {{ profileSaving() ? 'Saving…' : 'Save changes' }}
            </button>
          </form>
        </div>

        <!-- Password change -->
        <div class="rounded-2xl border border-silver-700 bg-white p-8 shadow-card-md space-y-4">
          <h2 class="text-lg font-semibold text-jet_black-500">Change Password</h2>
          <form [formGroup]="pwForm" (ngSubmit)="changePassword()" class="space-y-4">
            <div>
              <label for="pf-curpw" class="block text-sm font-medium text-jet_black-500">Current Password</label>
              <input id="pf-curpw" type="password" formControlName="currentPassword"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200" />
            </div>
            <div>
              <label for="pf-newpw" class="block text-sm font-medium text-jet_black-500">New Password</label>
              <input id="pf-newpw" type="password" formControlName="newPassword"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200" />
              <span *ngIf="pwForm.get('newPassword')?.invalid && pwForm.get('newPassword')?.touched" class="text-xs text-red-500 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special char.</span>
            </div>
            <div>
              <label for="pf-confpw" class="block text-sm font-medium text-jet_black-500">Confirm New Password</label>
              <input id="pf-confpw" type="password" formControlName="confirmPassword"
                class="mt-2 h-12 w-full rounded-xl border border-silver-700 bg-transparent px-4 font-body text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2 transition-all duration-200" />
            </div>
            <div *ngIf="pwSuccess()" class="text-sm text-green-700 font-medium">Password changed successfully.</div>
            <div *ngIf="pwError()" class="text-sm text-red-600">{{ pwError() }}</div>
            <button type="submit" [disabled]="pwSaving()"
              class="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-silver-700 text-jet_black-500 font-body font-medium bg-white hover:bg-silver-900 hover:border-coral_glow-500/30 hover:shadow-card active:scale-[0.98] disabled:opacity-70 transition-all duration-200">
              {{ pwSaving() ? 'Updating…' : 'Change password' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  `
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  profileSaving = signal(false);
  profileSuccess = signal(false);
  profileError = signal<string | null>(null);
  pwSaving = signal(false);
  pwSuccess = signal(false);
  pwError = signal<string | null>(null);

  profileForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    mobileNumber: new FormControl('', { nonNullable: true })
  });

  pwForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getMyProfile().subscribe(p => {
      this.profile.set(p);
      this.profileForm.patchValue({ fullName: p.fullName, mobileNumber: p.mobileNumber || '' });
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.profileSaving.set(true);
    this.profileSuccess.set(false);
    this.profileError.set(null);
    const v = this.profileForm.getRawValue();
    this.userService.updateMyProfile(v).pipe(catchError(err => {
      this.profileError.set(err?.error || 'Update failed.');
      this.profileSaving.set(false);
      return of(null);
    })).subscribe(res => {
      this.profileSaving.set(false);
      if (res) { this.profile.set(res); this.profileSuccess.set(true); }
    });
  }

  changePassword(): void {
    const v = this.pwForm.getRawValue();
    if (v.newPassword !== v.confirmPassword) { this.pwError.set('Passwords do not match.'); return; }
    if (this.pwForm.invalid) { this.pwForm.markAllAsTouched(); return; }
    this.pwSaving.set(true);
    this.pwSuccess.set(false);
    this.pwError.set(null);
    this.userService.changePassword(v.currentPassword, v.newPassword).pipe(catchError(err => {
      this.pwError.set(err?.error || 'Password change failed.');
      this.pwSaving.set(false);
      return of(null);
    })).subscribe(res => {
      this.pwSaving.set(false);
      if (res) { this.pwSuccess.set(true); this.pwForm.reset(); }
    });
  }
}
