import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    const user = userService.currentUser();
    const token = localStorage.getItem('token');

    // Check if user is authenticated and is an admin
    if (token && user?.isAdmin) {
        return true;
    }

    // If token exists but user not loaded yet, or not admin
    if (token && !user) {
        // User might still be loading, allow access and let the component handle it
        // Or redirect to admin-login if we want to be strict
        router.navigate(['/admin-login']);
        return false;
    }

    // Redirect non-admin users
    if (token && user && !user.isAdmin) {
        // Clear session if they are not admin
        localStorage.removeItem('token');
        router.navigate(['/admin-login']);
        return false;
    }

    // No token, redirect to admin login
    router.navigate(['/admin-login']);
    return false;
};
