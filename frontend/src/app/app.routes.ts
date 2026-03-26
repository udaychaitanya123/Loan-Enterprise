import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoanListComponent } from './features/loan-application/loan-list/loan-list.component';
import { LoanFormComponent } from './features/loan-application/loan-form/loan-form.component';
import { LoanDetailComponent } from './features/loan-application/loan-detail/loan-detail.component';
import { AdminComponent } from './features/admin/admin.component';
import { AdminUsersComponent } from './features/admin/admin-users.component';
import { ProfileComponent } from './features/profile/profile.component';
import { CalculatorPageComponent } from './features/calculator/calculator-page.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'calculator', component: CalculatorPageComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'loans', component: LoanListComponent, canActivate: [authGuard] },
  { path: 'loans/new', component: LoanFormComponent, canActivate: [authGuard] },
  { path: 'loans/:id', component: LoanDetailComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TENANT_ADMIN'] }
  },
  {
    path: 'admin/users',
    component: AdminUsersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TENANT_ADMIN'] }
  },
  { path: '**', redirectTo: 'login' }
];
