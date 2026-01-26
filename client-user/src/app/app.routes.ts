import { Routes } from '@angular/router';
import { Menu } from './pages/menu/menu';
import { Order } from './pages/order/order';
import { Cart } from './pages/cart/cart';
import { Invite } from './pages/invite/invite';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'menu',
    component: Menu,
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    component: Order,
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    component: Cart,
    canActivate: [authGuard]
  },
  {
    path: 'invite',
    component: Invite,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  }
];
