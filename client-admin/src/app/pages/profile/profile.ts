import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopNavbar } from '../../shared/top-navbar/top-navbar';
import { OrderService, ConfirmedOrder } from '../../services/order.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, TopNavbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  orderService = inject(OrderService);
  userService = inject(UserService);
  router = inject(Router);

  viewingOrder = signal<ConfirmedOrder | null>(null);

  viewOrder(order: ConfirmedOrder) {
    this.viewingOrder.set(order);
  }

  closeView() {
    this.viewingOrder.set(null);
  }

  reorder(order: ConfirmedOrder) {
    this.orderService.addItems(order.items);
    this.closeView();
    this.router.navigate(['/cart']); // Corrected redirect
  }

  logout() {
    this.userService.logout();
  }
}
