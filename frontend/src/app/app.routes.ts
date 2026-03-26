import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoanListComponent } from './features/loan-application/loan-list/loan-list.component';
import { LoanFormComponent } from './features/loan-application/loan-form/loan-form.component';
import { LoanDetailComponent } from './features/loan-application/loan-detail/loan-detail.component';
import { AdminComponent } from './features/admin/admin.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'loans', component: LoanListComponent, canActivate: [authGuard] },
  { path: 'loans/new', component: LoanFormComponent, canActivate: [authGuard] },
  { path: 'loans/:id', component: LoanDetailComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TENANT_ADMIN'] }
  },
  { path: '**', redirectTo: 'login' }
];

