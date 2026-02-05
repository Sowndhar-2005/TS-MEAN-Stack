import { Component, signal, computed, inject, effect, OnDestroy } from '@angular/core';
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
export class TopNavbar implements OnDestroy {
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

  // Notifications logic
  notifications = signal<any[]>([]);
  showNotifications = signal(false);
  unreadCount = computed(() => this.notifications().length); // Only unread are sent by getMe

  private pollingInterval: any;

  constructor() {
    effect(() => {
      const currentUser = this.userService.currentUser();
      console.log('TopNavbar: Current User Updated:', currentUser?.name);

      if (currentUser && currentUser.notifications) {
        const unread = currentUser.notifications.filter((n: any) => !n.read); // Double check filter
        console.log('TopNavbar: Notifications found:', unread.length);

        // Only show unread notifications
        this.notifications.set([...unread].reverse());
      } else {
        console.log('TopNavbar: No notifications found');
        this.notifications.set([]);
      }
    });

    // START POLLING: Check for updates every 10 seconds
    this.startPolling();
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      if (this.userService.currentUser()) {
        console.log('TopNavbar: Polling for updates...');
        this.userService.getProfile().subscribe({
          next: (user) => {
            // Update the signal which will trigger the effect above
            // We need to merge status carefully, but here we just replace
            // Optimistic updates in "markAsRead" handle the immediate dismissal
            this.userService.currentUser.set(user);
            this.userService.walletBalance.set(user.walletBalance);
          },
          error: (err) => console.error('Polling error:', err)
        });
      }
    }, 10000); // 10 seconds
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  toggleNotifications() {
    console.log('TopNavbar: Toggling notifications. Current state:', this.showNotifications());
    this.showNotifications.update(v => !v);
  }

  dismissNotification(index: number) {
    const notification = this.notifications()[index];
    console.log('TopNavbar: Dismissing notification:', notification);

    this.notifications.update(notifs => notifs.filter((_, i) => i !== index));

    this.userService.markNotificationAsRead(notification).subscribe({
      next: () => console.log('TopNavbar: Notification marked as read successfully'),
      error: (err: any) => console.error('Failed to mark notification as read:', err)
    });
  }
}
