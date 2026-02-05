import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    const token = localStorage.getItem('token');
    const user = userService.currentUser();

    // No token, redirect to login
    if (!token) {
        router.navigate(['/admin-login']);
        return false;
    }

    // User already loaded
    if (user) {
        if (user.isAdmin) {
            return true;
        } else {
            // Non-admin user, clear and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            router.navigate(['/admin-login']);
            return false;
        }
    }

    // Token exists but user not loaded yet - fetch profile
    return userService.getProfile().pipe(
        map((fetchedUser: any) => {
            userService.currentUser.set(fetchedUser);
            if (fetchedUser.isAdmin) {
                return true;
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
                router.navigate(['/admin-login']);
                return false;
            }
        }),
        catchError(() => {
            // If profile fetch fails, logout and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            router.navigate(['/admin-login']);
            return of(false);
        })
    );
};
