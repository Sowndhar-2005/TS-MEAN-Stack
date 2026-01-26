import { Routes } from '@angular/router';
import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin-login',
    pathMatch: 'full'
  },
  {
    path: 'admin-login',
    component: AdminLogin
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [adminGuard]
  }
];
