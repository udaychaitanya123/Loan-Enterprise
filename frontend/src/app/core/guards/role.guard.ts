import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const roles = (route.data['roles'] as string[] | undefined) ?? [];
  if (roles.length === 0) return true;

  const allowed = auth.hasRole(...roles);
  if (!allowed) {
    void router.navigate(['/dashboard'], { queryParams: { error: 'access_denied' } });
    return false;
  }

  return true;
};

