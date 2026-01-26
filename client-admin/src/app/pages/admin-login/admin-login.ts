import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-admin-login',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './admin-login.html',
    styleUrl: './admin-login.css'
})
export class AdminLogin {
    userService = inject(UserService);
    router = inject(Router);
    fb = inject(FormBuilder);

    errorMessage = signal('');
    showPassword = signal(false);
    isLoading = signal(false);

    loginForm = this.fb.group({
        identifier: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    togglePassword() {
        this.showPassword.update(v => !v);
    }

    goToUserLogin() {
        window.location.href = 'http://localhost:4200/login';
    }

    onSubmit() {
        this.errorMessage.set('');
        if (this.loginForm.invalid) return;

        this.isLoading.set(true);

        this.userService.login(this.loginForm.value).subscribe({
            next: (response) => {
                if (response.user?.isAdmin) {
                    this.router.navigate(['/admin']);
                } else {
                    this.errorMessage.set('Access denied. Admin privileges required.');
                    this.userService.logout(); // Logout non-admin user
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Login error:', err);
                const errorMsg = err.error?.error || err.error?.message || 'Login failed';
                this.errorMessage.set(typeof errorMsg === 'string' ? errorMsg : 'Authentication failed.');
                this.isLoading.set(false);
            }
        });
    }
}
