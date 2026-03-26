import { Injectable, computed } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TenantService {
  readonly tenantName = computed(() => this.auth.getUser()?.tenantName ?? '');

  constructor(private auth: AuthService) {}
}

