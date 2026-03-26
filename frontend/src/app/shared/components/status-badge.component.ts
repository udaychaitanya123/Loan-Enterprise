import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-[0.15em]"
      [class]="badgeClass()"
    >
      <span class="h-1.5 w-1.5 rounded-full" [class]="dotClass()" aria-hidden="true"></span>
      <span class="leading-none">{{ statusLabel() }}</span>
    </span>
  `
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  statusLabel(): string {
    if (this.status === 'PENDING_REVIEW') return 'Pending';
    if (this.status === 'APPROVED') return 'Approved';
    if (this.status === 'REJECTED') return 'Rejected';
    if (this.status === 'REFERRED') return 'Referred';
    if (this.status === 'DRAFT') return 'Draft';
    return this.status;
  }

  badgeClass(): string {
    switch (this.status) {
      case 'APPROVED':
        return 'bg-silver-900 border-silver-700 text-jet_black-500';
      case 'PENDING_REVIEW':
        return 'bg-coral_glow-500/10 border-coral_glow-500/30 text-coral_glow-400';
      case 'REJECTED':
        return 'bg-jet_black-100 border-jet_black-300 text-silver-900';
      case 'REFERRED':
        return 'bg-blue_slate-500/10 border-blue_slate-500/30 text-blue_slate-600';
      case 'DRAFT':
        return 'bg-silver-800 border-silver-700 text-blue_slate-600';
      default:
        return 'bg-white border-silver-700 text-blue_slate-600';
    }
  }

  dotClass(): string {
    switch (this.status) {
      case 'APPROVED':
        return 'bg-jet_black-500';
      case 'PENDING_REVIEW':
        return 'bg-coral_glow-500 animate-pulse-dot';
      case 'REJECTED':
        return 'bg-silver-900';
      case 'REFERRED':
        return 'bg-blue_slate-500';
      case 'DRAFT':
        return 'bg-silver-500';
      default:
        return 'bg-silver-500';
    }
  }
}

