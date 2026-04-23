import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/enums';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data?.['role'] as UserRole;
  if (!expectedRole) {
    return true;
  }

  const userRole = authService.getUserRole();
  if (userRole === expectedRole || userRole === UserRole.Admin) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
