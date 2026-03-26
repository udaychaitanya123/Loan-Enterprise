import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-2xl border border-silver-700 bg-white p-7 shadow-card-md">
      <div class="flex items-center gap-2 mb-5">
        <svg class="h-5 w-5 text-coral_glow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <h3 class="text-sm font-mono uppercase tracking-[0.15em] text-blue_slate-600">EMI Calculator</h3>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-blue_slate-600 mb-1">
            Loan Amount: <span class="text-jet_black-500 font-semibold">{{ formatCurrency(amount) }}</span>
          </label>
          <input type="range" [(ngModel)]="amount" [min]="minAmount" [max]="maxAmount" step="1000"
            class="w-full accent-coral_glow-500 cursor-pointer" />
          <div class="flex justify-between text-xs text-blue_slate-600 mt-1">
            <span>{{ formatCurrency(minAmount) }}</span>
            <span>{{ formatCurrency(maxAmount) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-blue_slate-600 mb-1">Loan Term</label>
            <select [(ngModel)]="termMonths"
              class="w-full h-10 rounded-lg border border-silver-700 bg-transparent px-3 text-sm text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500">
              <option [value]="12">12 months</option>
              <option [value]="24">24 months</option>
              <option [value]="36">36 months</option>
              <option [value]="48">48 months</option>
              <option [value]="60">60 months</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-blue_slate-600 mb-1">Annual Rate (%)</label>
            <input type="number" [(ngModel)]="annualRate" min="1" max="50" step="0.1"
              class="w-full h-10 rounded-lg border border-silver-700 bg-transparent px-3 text-sm text-jet_black-500 focus:outline-none focus:ring-2 focus:ring-coral_glow-500" />
          </div>
        </div>

        <!-- Results -->
        <div class="mt-4 rounded-xl bg-gradient-to-br from-coral_glow-500/5 to-transparent border border-coral_glow-500/20 p-4 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue_slate-600">Monthly EMI</span>
            <span class="text-lg font-semibold text-jet_black-500">{{ formatCurrency(emi) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue_slate-600">Total Payment</span>
            <span class="text-sm font-medium text-jet_black-500">{{ formatCurrency(totalPayment) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue_slate-600">Total Interest</span>
            <span class="text-sm font-medium text-coral_glow-500">{{ formatCurrency(totalInterest) }}</span>
          </div>
        </div>

        <!-- Visual bar: principal vs interest -->
        <div class="mt-3">
          <div class="flex h-3 rounded-full overflow-hidden bg-silver-900">
            <div class="bg-coral_glow-500 transition-all duration-500"
              [style.width.%]="principalPct"></div>
            <div class="bg-blue_slate-600/40 flex-1"></div>
          </div>
          <div class="flex justify-between mt-1 text-xs text-blue_slate-600">
            <span>Principal {{ principalPct | number:'1.0-0' }}%</span>
            <span>Interest {{ 100 - principalPct | number:'1.0-0' }}%</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoanCalculatorComponent {
  @Input() defaultRate = 12.5;
  @Input() minAmount = 1000;
  @Input() maxAmount = 500000;

  amount = 50000;
  termMonths = 36;
  annualRate = this.defaultRate;

  get monthlyRate(): number { return this.annualRate / 1200; }
  get n(): number { return this.termMonths; }

  get emi(): number {
    const r = this.monthlyRate;
    if (r === 0) return this.amount / this.n;
    return (this.amount * r * Math.pow(1 + r, this.n)) / (Math.pow(1 + r, this.n) - 1);
  }

  get totalPayment(): number { return this.emi * this.n; }
  get totalInterest(): number { return this.totalPayment - this.amount; }
  get principalPct(): number { return (this.amount / this.totalPayment) * 100; }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }
}
