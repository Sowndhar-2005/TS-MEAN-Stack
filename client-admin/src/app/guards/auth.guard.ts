import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      router.navigate(['/admin']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
