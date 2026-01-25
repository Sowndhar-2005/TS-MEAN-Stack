import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminUser, DashboardStats } from '../../services/admin.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Expose Math to template
  Math = Math;

  // State signals
  users = signal<AdminUser[]>([]);
  filteredUsers = signal<AdminUser[]>([]);
  dashboardStats = signal<DashboardStats | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');
  searchQuery = signal<string>('');

  // User Detail Modal state
  showUserDetailModal = signal<boolean>(false);
  selectedDetailUser = signal<AdminUser | null>(null);

  // Wallet Modal state
  showWalletModal = signal<boolean>(false);
  selectedUser = signal<AdminUser | null>(null);
  walletAmount = signal<number>(0);
  walletReason = signal<string>('');
  isAddingWallet = signal<boolean>(true);
  processingWallet = signal<boolean>(false);

  // Password Reset Modal state
  showPasswordModal = signal<boolean>(false);
  newPassword = signal<string>('');
  confirmPassword = signal<string>('');
  processingPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  // Toast state
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal<boolean>(false);

  // Active tab
  activeTab = signal<'users' | 'stats'>('users');

  // Filter state
  filterType = signal<'all' | 'dayscholar' | 'hosteller'>('all');

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    // Load dashboard stats
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats.set(stats);
      },
      error: (err) => console.error('Error loading stats:', err),
    });

    // Load all users
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error.set('Failed to load users');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.filterType();

    let filtered = this.users();

    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter((user) => user.userType === type);
    }

    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.registrationNumber.toLowerCase().includes(query) ||
          (user.department && user.department.toLowerCase().includes(query))
      );
    }

    this.filteredUsers.set(filtered);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(type: 'all' | 'dayscholar' | 'hosteller'): void {
    this.filterType.set(type);
    this.applyFilters();
  }

  setActiveTab(tab: 'users' | 'stats'): void {
    this.activeTab.set(tab);
  }

  // User Detail Modal functions
  openUserDetailModal(user: AdminUser): void {
    this.selectedDetailUser.set(user);
    this.showUserDetailModal.set(true);
  }

  closeUserDetailModal(): void {
    this.showUserDetailModal.set(false);
    this.selectedDetailUser.set(null);
  }

  // Wallet Modal functions
  openAddWalletModal(user: AdminUser): void {
    this.selectedUser.set(user);
    this.walletAmount.set(0);
    this.walletReason.set('');
    this.isAddingWallet.set(true);
    this.showWalletModal.set(true);
  }

  openReduceWalletModal(user: AdminUser): void {
    this.selectedUser.set(user);
    this.walletAmount.set(0);
    this.walletReason.set('');
    this.isAddingWallet.set(false);
    this.showWalletModal.set(true);
  }

  closeWalletModal(): void {
    this.showWalletModal.set(false);
    this.selectedUser.set(null);
    this.walletAmount.set(0);
    this.walletReason.set('');
  }

  submitWallet(): void {
    const user = this.selectedUser();
    const amount = this.walletAmount();
    const reason = this.walletReason();

    if (!user || amount <= 0) {
      this.showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    // Check if reducing more than available
    if (!this.isAddingWallet() && amount > user.walletBalance) {
      this.showToastMessage('Cannot reduce more than available balance', 'error');
      return;
    }

    this.processingWallet.set(true);

    const request = this.isAddingWallet()
      ? this.adminService.addWalletBalance(user.id, amount, reason)
      : this.adminService.reduceWalletBalance(user.id, amount, reason);

    request.subscribe({
      next: (response) => {
        // Update local user data
        const updatedUsers = this.users().map((u) =>
          u.id === user.id ? { ...u, walletBalance: response.user.walletBalance } : u
        );
        this.users.set(updatedUsers);
        this.applyFilters();

        // Update detail modal if open
        if (this.selectedDetailUser()?.id === user.id) {
          this.selectedDetailUser.set({ ...user, walletBalance: response.user.walletBalance });
        }

        const action = this.isAddingWallet() ? 'added to' : 'reduced from';
        this.showToastMessage(`₹${amount} ${action} ${user.name}'s wallet`, 'success');
        this.closeWalletModal();
        this.processingWallet.set(false);

        // Refresh stats
        this.adminService.getDashboardStats().subscribe({
          next: (stats) => this.dashboardStats.set(stats),
        });
      },
      error: (err) => {
        this.showToastMessage(err.error?.error || 'Failed to update wallet', 'error');
        this.processingWallet.set(false);
      },
    });
  }

  // Password Modal functions
  openPasswordModal(user: AdminUser): void {
    this.selectedUser.set(user);
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.showPasswordModal.set(true);
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
    this.newPassword.set('');
    this.confirmPassword.set('');
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword.set(!this.showNewPassword());
    } else {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

  submitPasswordReset(): void {
    const user = this.selectedUser();
    const password = this.newPassword();
    const confirm = this.confirmPassword();

    if (!user) return;

    if (password.length < 6) {
      this.showToastMessage('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirm) {
      this.showToastMessage('Passwords do not match', 'error');
      return;
    }

    this.processingPassword.set(true);

    this.adminService.resetUserPassword(user.id, password).subscribe({
      next: () => {
        this.showToastMessage(`Password reset for ${user.name}`, 'success');
        this.closePasswordModal();
        this.processingPassword.set(false);
      },
      error: (err) => {
        this.showToastMessage(err.error?.error || 'Failed to reset password', 'error');
        this.processingPassword.set(false);
      },
    });
  }

  // Quick wallet action from user card
  quickAddWallet(user: AdminUser, event: Event): void {
    event.stopPropagation();
    this.openAddWalletModal(user);
  }

  quickReduceWallet(user: AdminUser, event: Event): void {
    event.stopPropagation();
    this.openReduceWalletModal(user);
  }

  // Toast function
  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);

    setTimeout(() => this.showToast.set(false), 3000);
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/admin-login']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRandomGradient(id: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a8edea, #fed6e3)',
      'linear-gradient(135deg, #ff9a9e, #fecfef)',
      'linear-gradient(135deg, #667eea, #764ba2)',
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }
}
