import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="sticky top-0 z-20 border-b border-silver-700/70 bg-white/70 backdrop-blur">
      <div class="max-w-content mx-auto px-6">
        <div class="flex h-16 items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <a
              class="font-display text-sm tracking-tight text-jet_black-500 hover:opacity-90 transition-opacity"
              routerLink="/dashboard"
            >
              <span class="relative inline-flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-accent-gradient shadow-accent" aria-hidden="true"></span>
                Enterprise Loan
              </span>
            </a>

            <div class="hidden sm:flex items-center gap-2">
              <a
                class="rounded-xl px-3 py-2 text-sm text-blue_slate-600 hover:text-jet_black-500 hover:bg-silver-900 transition-colors"
                routerLink="/dashboard"
                routerLinkActive="text-jet_black-500 bg-silver-900"
                [routerLinkActiveOptions]="{ exact: true }"
              >Dashboard</a>
              <a
                class="rounded-xl px-3 py-2 text-sm text-blue_slate-600 hover:text-jet_black-500 hover:bg-silver-900 transition-colors"
                routerLink="/loans"
                routerLinkActive="text-jet_black-500 bg-silver-900"
                [routerLinkActiveOptions]="{ exact: true }"
              >Loans</a>
              <a
                *ngIf="auth.hasRole('APPLICANT')"
                class="rounded-xl px-3 py-2 text-sm text-blue_slate-600 hover:text-jet_black-500 hover:bg-silver-900 transition-colors"
                routerLink="/loans/new"
                routerLinkActive="text-jet_black-500 bg-silver-900"
                [routerLinkActiveOptions]="{ exact: true }"
              >New Application</a>
              <a
                *ngIf="auth.hasRole('TENANT_ADMIN')"
                class="rounded-xl px-3 py-2 text-sm text-blue_slate-600 hover:text-jet_black-500 hover:bg-silver-900 transition-colors"
                routerLink="/admin"
                [queryParams]="{ loanType: loanType }"
                routerLinkActive="text-jet_black-500 bg-silver-900"
                [routerLinkActiveOptions]="{ exact: true }"
              >Admin</a>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden md:flex flex-col items-end leading-tight" *ngIf="user() as u">
              <div class="text-sm font-medium text-jet_black-500">{{ u.fullName }}</div>
              <div class="text-xs text-blue_slate-600">{{ u.tenantName }}</div>
            </div>

            <button
              type="button"
              (click)="logout()"
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
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  // MVP uses a single demo loan type.
  readonly loanType = 'PERSONAL_LOAN';

  readonly user = computed(() => this.auth.getUser());

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
  }
}

