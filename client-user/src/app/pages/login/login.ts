import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  userService = inject(UserService);
  router = inject(Router);
  fb = inject(FormBuilder);

  isLoginMode = signal(true);
  errorMessage = signal('');
  showPassword = signal(false);

  departments = ['CSE', 'AIML', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
  years = [1, 2, 3, 4];

  // Login Form
  loginForm = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  // Register Form
  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]], // Can be college or gmail
    registrationNumber: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    userType: ['dayscholar', Validators.required],
    department: [''],
    year: [null]
  });

  toggleMode() {
    this.isLoginMode.update(v => !v);
    this.errorMessage.set('');
    this.loginForm.reset();
    this.registerForm.reset({ userType: 'dayscholar' });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    this.errorMessage.set('');

    if (this.isLoginMode()) {
      if (this.loginForm.invalid) return;

      this.userService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.user?.isAdmin) {
            this.errorMessage.set('Admins must use the Admin Login portal.');
            this.userService.logout(false); // don't navigate, just clear state
            // Or explicitly navigate to admin login?
            // The user request says "remove food order don't login admin".
            // Let's explicitely logout and stay or go to admin login.
            // But userService.logout() navigates to /login.
            // Let's just show error.
          } else {
            this.router.navigate(['/menu']);
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          const errorMsg = err.error?.error || err.error?.message || 'Login failed';
          this.errorMessage.set(typeof errorMsg === 'string' ? errorMsg : 'Login failed. Please check your credentials.');
        }
      });
    } else {
      if (this.registerForm.invalid) return;

      this.userService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/menu']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Registration failed');
        }
      });
    }
  }
}
