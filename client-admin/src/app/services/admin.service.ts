import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
    userType: 'dayscholar' | 'hosteller';
    department?: string;
    year?: number;
    walletBalance: number;
    collegePoints: number;
    totalSpent: number;
    totalOrders: number;
    createdAt: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalDayScholars: number;
    totalHostellers: number;
    totalPointsDistributed: number;
    recentUsers: number;
}

export interface PointsResponse {
    message: string;
    user: {
        id: string;
        name: string;
        registrationNumber: string;
        collegePoints: number;
    };
    pointsAdded?: number;
    pointsDeducted?: number;
    reason: string;
}

export interface WalletResponse {
    message: string;
    user: {
        id: string;
        name: string;
        registrationNumber: string;
        walletBalance: number;
    };
    amountAdded?: number;
    amountReduced?: number;
    reason: string;
}

export interface PasswordResetResponse {
    message: string;
    userId: string;
}

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = '/api/admin';

    createUser(userData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users`, userData);
    }

    // Signals
    users = signal<AdminUser[]>([]);
    dashboardStats = signal<DashboardStats | null>(null);
    loading = signal<boolean>(false);
    error = signal<string>('');

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`).pipe(
            tap((stats) => this.dashboardStats.set(stats))
        );
    }

    getAllUsers(): Observable<{ users: AdminUser[]; count: number }> {
        this.loading.set(true);
        return this.http.get<{ users: AdminUser[]; count: number }>(`${this.apiUrl}/users`).pipe(
            tap({
                next: (response) => {
                    this.users.set(response.users);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            })
        );
    }

    getUserById(userId: string): Observable<AdminUser> {
        return this.http.get<AdminUser>(`${this.apiUrl}/users/${userId}`);
    }

    searchUsers(query: string): Observable<{ users: AdminUser[]; count: number }> {
        return this.http.get<{ users: AdminUser[]; count: number }>(`${this.apiUrl}/users/search`, {
            params: { query },
        });
    }

    addPoints(userId: string, points: number, reason?: string): Observable<PointsResponse> {
        return this.http.post<PointsResponse>(`${this.apiUrl}/users/${userId}/add-points`, {
            points,
            reason,
        });
    }

    deductPoints(userId: string, points: number, reason?: string): Observable<PointsResponse> {
        return this.http.post<PointsResponse>(`${this.apiUrl}/users/${userId}/deduct-points`, {
            points,
            reason,
        });
    }

    // Wallet Management
    addWalletBalance(userId: string, amount: number, reason?: string): Observable<WalletResponse> {
        return this.http.post<WalletResponse>(`${this.apiUrl}/users/${userId}/add-wallet`, {
            amount,
            reason,
        });
    }

    reduceWalletBalance(userId: string, amount: number, reason?: string): Observable<WalletResponse> {
        return this.http.post<WalletResponse>(`${this.apiUrl}/users/${userId}/reduce-wallet`, {
            amount,
            reason,
        });
    }

    // User Management
    deleteUser(userId: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${userId}`);
    }

    // Profile Change Request Management
    getPendingChangeRequests(): Observable<any[]> {
        return this.http.get<any[]>('/api/profile-changes/pending');
    }

    reviewChangeRequest(requestId: string, action: 'approve' | 'reject', rejectionReason?: string): Observable<any> {
        return this.http.put<any>(`/api/profile-changes/${requestId}/review`, {
            action,
            rejectionReason
        });
    }
}
