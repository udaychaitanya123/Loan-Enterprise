import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../core/services/user.service';
import { catchError, of } from 'rxjs';

const ALL_ROLES = ['APPLICANT', 'LOAN_OFFICER', 'FINANCE_OFFICER', 'TENANT_ADMIN'];

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-8">
      <div class="flex flex-col gap-6">
        <div>
          <div class="inline-flex items-center gap-3 rounded-full border border-silver-700 bg-white px-5 py-2 w-fit">
            <span class="h-2 w-2 rounded-full bg-coral_glow-500 animate-pulse-dot" aria-hidden="true"></span>
            <span class="font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Administration</span>
          </div>
          <h1 class="mt-4 font-display text-3xl tracking-tight text-jet_black-500">User Management</h1>
        </div>

        <div class="rounded-2xl border border-silver-700 bg-white shadow-card-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-silver-900 border-b border-silver-700">
                <tr>
                  <th class="px-6 py-3 text-left font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Name</th>
                  <th class="px-6 py-3 text-left font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Email</th>
                  <th class="px-6 py-3 text-left font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Mobile</th>
                  <th class="px-6 py-3 text-left font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Roles</th>
                  <th class="px-6 py-3 text-left font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Status</th>
                  <th class="px-6 py-3 text-left font-mono text-xs uppercase tracking-[0.15em] text-blue_slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of users()" class="border-b border-silver-700 hover:bg-silver-900/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-jet_black-500">{{ u.fullName }}</td>
                  <td class="px-6 py-4 text-blue_slate-600">{{ u.email }}</td>
                  <td class="px-6 py-4 text-blue_slate-600">{{ u.mobileNumber || '—' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span *ngFor="let r of u.roles"
                        class="px-2 py-0.5 text-xs rounded-full border font-mono"
                        [class]="roleBadgeClass(r)">{{ r }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 text-xs rounded-full font-mono"
                      [class]="u.status === 'ACTIVE' ? 'bg-green-50 border border-green-300 text-green-700' : 'bg-red-50 border border-red-300 text-red-700'">
                      {{ u.status || 'ACTIVE' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <button (click)="openRoleModal(u)"
                        class="text-xs px-3 py-1.5 rounded-lg border border-silver-700 text-jet_black-500 hover:bg-silver-900 hover:border-coral_glow-500/30 transition-all">
                        Roles
                      </button>
                      <button (click)="toggleStatus(u)"
                        class="text-xs px-3 py-1.5 rounded-lg border transition-all"
                        [class]="u.status === 'ACTIVE' ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'">
                        {{ u.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Role Modal -->
        <div *ngIf="modalUser()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div class="bg-white rounded-2xl border border-silver-700 p-8 shadow-card-xl w-full max-w-sm mx-4">
            <h2 class="text-base font-semibold text-jet_black-500 mb-4">
              Manage roles for <span class="text-coral_glow-500">{{ modalUser()?.fullName }}</span>
            </h2>
            <div class="space-y-3 mb-6">
              <label *ngFor="let role of allRoles" class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" [checked]="modalRoles().includes(role)" (change)="toggleRole(role)"
                  class="h-4 w-4 accent-coral_glow-500 rounded" />
                <span class="text-sm text-jet_black-500 font-mono">{{ role }}</span>
              </label>
            </div>
            <div *ngIf="modalError()" class="text-xs text-red-600 mb-3">{{ modalError() }}</div>
            <div class="flex gap-3">
              <button (click)="saveRoles()"
                class="flex-1 h-10 rounded-xl bg-gradient-to-r from-coral_glow-400 to-coral_glow-500 text-white text-sm font-medium hover:brightness-110 transition-all">
                Save
              </button>
              <button (click)="closeModal()"
                class="flex-1 h-10 rounded-xl border border-silver-700 text-jet_black-500 text-sm font-medium hover:bg-silver-900 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AdminUsersComponent implements OnInit {
  users = signal<UserProfile[]>([]);
  modalUser = signal<UserProfile | null>(null);
  modalRoles = signal<string[]>([]);
  modalError = signal<string | null>(null);
  allRoles = ALL_ROLES;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.listUsers().subscribe(list => this.users.set(list));
  }

  openRoleModal(u: UserProfile): void {
    this.modalUser.set(u);
    this.modalRoles.set([...u.roles]);
    this.modalError.set(null);
  }

  closeModal(): void { this.modalUser.set(null); }

  toggleRole(role: string): void {
    const cur = this.modalRoles();
    this.modalRoles.set(cur.includes(role) ? cur.filter(r => r !== role) : [...cur, role]);
  }

  saveRoles(): void {
    const u = this.modalUser();
    if (!u) return;
    this.userService.updateUserRoles(u.id, this.modalRoles()).pipe(
      catchError(err => {
        this.modalError.set(err?.error || 'Failed to update roles.');
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.users.update(list => list.map(usr => usr.id === res.id ? res : usr));
        this.closeModal();
      }
    });
  }

  toggleStatus(u: UserProfile): void {
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.userService.updateUserStatus(u.id, newStatus).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res) this.users.update(list => list.map(usr => usr.id === res.id ? res : usr));
    });
  }

  roleBadgeClass(role: string): string {
    switch (role) {
      case 'TENANT_ADMIN': return 'bg-coral_glow-500/10 border-coral_glow-500/30 text-coral_glow-400';
      case 'LOAN_OFFICER': return 'bg-blue_slate-500/10 border-blue_slate-500/30 text-blue_slate-600';
      case 'FINANCE_OFFICER': return 'bg-purple-100 border-purple-300 text-purple-700';
      default: return 'bg-silver-900 border-silver-700 text-blue_slate-600';
    }
  }
}
