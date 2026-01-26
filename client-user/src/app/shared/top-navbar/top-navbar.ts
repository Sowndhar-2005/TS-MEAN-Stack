import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-top-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './top-navbar.html',
  styleUrl: './top-navbar.css'
})
export class TopNavbar {
  userService = inject(UserService);
  orderService = inject(OrderService);
  cartService = inject(CartService);
  router = inject(Router);
  
  // Cart item count from CartService
  cartItemCount = computed(() => this.cartService.cartItems().length);
  
  // Computed number of unique items in order (not total quantity)
  orderItemCount = computed(() => {
    return this.orderService.orderItems().length;
  });
}
