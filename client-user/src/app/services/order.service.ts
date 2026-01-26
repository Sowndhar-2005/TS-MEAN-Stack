import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Food } from './food.service';
import { UserService } from './user.service';
import { tap } from 'rxjs';

export interface OrderItem {
  food: Food;
  quantity: number;
  specialInstructions?: string;
}

// Confirmed Order Interface
export interface ConfirmedOrder {
  id: string;
  items: OrderItem[];
  total: number;
  date: Date;
  status: 'Cooking' | 'Ready' | 'Completed';
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  http = inject(HttpClient);
  userService = inject(UserService);

  // Current pending order items
  orderItems = signal<OrderItem[]>([]);

  // Confirmed/Past orders
  activeOrders = signal<ConfirmedOrder[]>([]);

  // Currently selected item to display in left card
  selectedOrderItem = signal<OrderItem | null>(null);

  // Group name for the current order (if ordered from cart group)
  orderGroupName = signal<string | null>(null);

  constructor() {
    this.loadFromStorage();
    this.fetchMyOrders();
  }

  // Fetch confirmed orders from backend
  fetchMyOrders() {
    this.http.get<any>('/api/orders/my').subscribe({
      next: (res) => {
        // Map backend order format to frontend format if needed
        // For now, assuming relatively compatible or just utilizing the 'orders' array
        const mappedOrders = res.orders.map((o: any) => ({
          id: o.orderId,
          items: o.items.map((i: any) => ({
            food: { name: i.name, price: i.price, image: '', _id: i.foodId }, // Partial food data
            quantity: i.quantity
          })),
          total: o.totalAmount,
          date: new Date(o.createdAt),
          status: o.status.charAt(0).toUpperCase() + o.status.slice(1) // Capitalize
        }));
        this.activeOrders.set(mappedOrders);
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
  }

  // Confirm and place the current order
  confirmOrder(paymentMethod: 'WALLET' | 'UPI' = 'WALLET'): boolean {
    const items = this.orderItems();
    if (items.length === 0) return false;

    // Use 'wallet' or 'upi' (lowercase) to match backend enum
    const method = paymentMethod === 'WALLET' ? 'wallet' : 'upi';

    this.http.post<any>('/api/orders', {
      paymentMethod: method,
      items: items.map(i => ({
        foodId: i.food._id,
        quantity: i.quantity,
        specialInstructions: i.specialInstructions
      }))
    }).subscribe({
      next: (res) => {
        console.log('Order Success:', res);
        alert('Order placed successfully!');

        // Refresh User Data (Balance)
        this.userService.getProfile().subscribe(user => {
          this.userService.currentUser.set(user);
          this.userService.walletBalance.set(user.walletBalance);
          this.userService.totalSpent.set(user.totalSpent);
          this.userService.totalOrders.set(user.totalOrders);
        });

        this.clearOrders();
        this.fetchMyOrders();
      },
      error: (err) => {
        console.error('Order Failed:', err);
        alert('Order Failed: ' + (err.error?.error || 'Unknown Error'));
      }
    });

    return true; // Optimistically return true to close modal (Error alert handles failure)
  }

  // Add item to order
  addToOrder(food: Food, quantity: number = 1) {
    const currentItems = this.orderItems();
    const existingIndex = currentItems.findIndex(item => item.food._id === food._id);

    let updatedItems;
    if (existingIndex >= 0) {
      // Update existing item quantity
      updatedItems = [...currentItems];
      updatedItems[existingIndex].quantity += quantity;
      this.selectedOrderItem.set(updatedItems[existingIndex]);
    } else {
      // Add new item
      const newItem: OrderItem = { food, quantity };
      updatedItems = [...currentItems, newItem];
      this.selectedOrderItem.set(newItem);
    }

    this.orderItems.set(updatedItems);
    this.saveOrderItems(updatedItems);
  }

  // Add multiple items to order
  addItems(items: { food: Food, quantity: number }[], groupName?: string) {
    const currentItems = this.orderItems();
    const updatedItems = [...currentItems];

    items.forEach(newItem => {
      const existingIndex = updatedItems.findIndex(item => item.food._id === newItem.food._id);
      if (existingIndex >= 0) {
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + newItem.quantity
        };
      } else {
        updatedItems.push({ food: newItem.food, quantity: newItem.quantity });
      }
    });

    if (groupName) {
      this.orderGroupName.set(groupName);
    }

    this.orderItems.set(updatedItems);
    this.saveOrderItems(updatedItems);

    if (!this.selectedOrderItem() && updatedItems.length > 0) {
      this.selectedOrderItem.set(updatedItems[0]);
    }
  }

  // Select an item to view
  selectOrderItem(item: OrderItem) {
    this.selectedOrderItem.set(item);
  }

  // Update quantity
  updateQuantity(foodId: string, quantity: number) {
    const currentItems = this.orderItems();
    const updatedItems = currentItems.map(item =>
      item.food._id === foodId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0); // Remove if quantity is 0

    this.orderItems.set(updatedItems);
    this.saveOrderItems(updatedItems);

    // Update selected if it's the one being modified
    if (this.selectedOrderItem()?.food._id === foodId) {
      const updatedItem = updatedItems.find(item => item.food._id === foodId);
      this.selectedOrderItem.set(updatedItem || null);
    }
  }

  // Remove item
  removeItem(foodId: string) {
    const currentItems = this.orderItems();
    const updatedItems = currentItems.filter(item => item.food._id !== foodId);
    this.orderItems.set(updatedItems);
    this.saveOrderItems(updatedItems);

    // Clear selected if it's the one being removed
    if (this.selectedOrderItem()?.food._id === foodId) {
      this.selectedOrderItem.set(updatedItems[0] || null);
    }
  }

  // Calculate totals
  getSubtotal(): number {
    return this.orderItems().reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
  }

  getTax(): number {
    return 0; // Tax removed
  }

  getTotal(): number {
    return this.getSubtotal();
  }

  // Clear all orders
  clearOrders() {
    this.orderItems.set([]);
    this.saveOrderItems([]);
    this.selectedOrderItem.set(null);
    this.orderGroupName.set(null);
  }

  // Persistence helpers
  private saveOrderItems(items: OrderItem[]) {
    localStorage.setItem('temp_order_items', JSON.stringify(items));
  }

  private saveActiveOrders(orders: ConfirmedOrder[]) {
    // No longer needed as we fetch from API
    // localStorage.setItem('user_orders', JSON.stringify(orders));
  }

  private loadFromStorage() {
    try {
      const tempItems = localStorage.getItem('temp_order_items');
      if (tempItems) {
        this.orderItems.set(JSON.parse(tempItems));
      }
    } catch (e) {
      console.error('Failed to load orders from storage', e);
    }
  }
}
