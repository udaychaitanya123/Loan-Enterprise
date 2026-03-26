import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService, TenantPublic } from '../../core/services/user.service';
import { LoanCalculatorComponent } from '../../shared/components/loan-calculator.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-calculator-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoanCalculatorComponent],
  template: `
    <section class="py-10 lg:py-16">
      <div class="mx-auto max-w-2xl flex flex-col gap-8">
        <div>
          <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
            <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
            <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Free Tool</span>
          </div>
          <h1 class="mt-4 font-display text-[2.75rem] leading-[1.05] tracking-tight text-jet_black-500">
            Loan EMI <span class="gradient-text">Calculator</span>
          </h1>
          <p class="mt-3 text-base text-blue_slate-600">
            Explore loan scenarios instantly. No sign-up required.
          </p>
          <p class="mt-2 text-sm text-blue_slate-600">
            Ready to apply?
            <a routerLink="/signup" class="text-coral_glow-500 hover:underline font-medium">Create a free account →</a>
          </p>
        </div>
        <app-loan-calculator [defaultRate]="defaultRate()" [minAmount]="1000" [maxAmount]="500000"></app-loan-calculator>
      </div>
    </section>
  `
})
export class CalculatorPageComponent implements OnInit {
  defaultRate = signal(12.5);

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Try to load tenant rates for context (optional enrichment)
    this.userService.getPublicTenants().pipe(catchError(() => of([]))).subscribe();
  }
}
