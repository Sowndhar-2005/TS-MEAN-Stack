import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { TopNavbar } from '../../shared/top-navbar/top-navbar';

import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, TopNavbar],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);

  // Search query
  searchQuery = signal('');
  searchType = signal<'all' | 'food' | 'group'>('all');
  isDropdownOpen = signal(false);

  // Grouping Mode
  isSelectionMode = signal(false);
  selectedItems = signal<Set<string>>(new Set());
  newGroupName = signal('');

  // Items not in any custom group (Flat list)
  ungroupedItems = computed(() => {
    let items = this.cartService.cartItems().filter(item => !item.customGroup);
    const query = this.searchQuery().toLowerCase();
    const type = this.searchType();

    if (query) {
      if (type === 'all' || type === 'food') {
        items = items.filter(item =>
          item.food.name.toLowerCase().includes(query)
        );
      } else if (type === 'group') {
        // In "Group" mode, ungrouped items don't match anything unless query is empty
        return [];
      }
    }
    return items;
  });

  // Custom Groups
  customGroups = computed(() => {
    const items = this.cartService.cartItems().filter(item => !!item.customGroup);
    const groups = new Map<string, { items: CartItem[], total: number }>();
    const query = this.searchQuery().toLowerCase();
    const type = this.searchType();

    items.forEach(item => {
      const groupName = item.customGroup!;

      const isGroupNameMatch = groupName.toLowerCase().includes(query);
      const isItemNameMatch = item.food.name.toLowerCase().includes(query);

      let matches = !query;
      if (query) {
        if (type === 'all') {
          matches = isGroupNameMatch || isItemNameMatch;
        } else if (type === 'food') {
          matches = isItemNameMatch;
        } else if (type === 'group') {
          matches = isGroupNameMatch;
        }
      }

      if (matches) {
        if (!groups.has(groupName)) {
          groups.set(groupName, { items: [], total: 0 });
        }
        const group = groups.get(groupName)!;
        group.items.push(item);
        group.total += item.food.price * item.quantity;
      }
    });

    return Array.from(groups.entries()).map(([name, data]) => ({
      name,
      items: data.items,
      total: data.total
    }));
  });

  ungroupedTotal = computed(() => {
    return this.ungroupedItems().reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
  });

  cartTotal = computed(() => this.cartService.getTotal());
  cartItemCount = computed(() => this.cartService.cartItems().length);


  // Actions
  toggleSelectionMode(groupName?: string) {
    if (groupName) {
      // Edit existing group
      const groupItems = this.cartService.cartItems()
        .filter(item => item.customGroup === groupName)
        .map(item => item.instanceId);

      this.selectedItems.set(new Set(groupItems));
      this.newGroupName.set(groupName);
    } else {
      // New group mode
      this.selectedItems.set(new Set());
      this.newGroupName.set('');
    }
    this.isSelectionMode.update(v => !v);
  }

  toggleItemSelection(instanceId: string) {
    const current = new Set(this.selectedItems());
    if (current.has(instanceId)) {
      current.delete(instanceId);
    } else {
      current.add(instanceId);
    }
    this.selectedItems.set(current);
  }

  saveGroup() {
    const name = this.newGroupName().trim();
    const ids = Array.from(this.selectedItems());

    if (name) {
      this.cartService.updateGroup(name, ids);

      this.isSelectionMode.set(false);
      this.selectedItems.set(new Set());
      this.newGroupName.set('');
    }
  }

  placeOrder(groupName: string, items: CartItem[]) {
    if (confirm(`Proceed to Order page with ${groupName}?`)) {
      // Add items to the Order Service (Food List)
      this.orderService.addItems(items, groupName);

      // Navigate to Orders page to review and pay
      this.router.navigate(['/orders']);
    }
  }

  updateQuantity(instanceId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.cartService.removeItem(instanceId);
    } else {
      this.cartService.updateQuantity(instanceId, newQuantity);
    }
  }

  removeItem(instanceId: string) {
    this.cartService.removeItem(instanceId);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  addItem() {
    this.router.navigate(['/menu']);
  }
}
