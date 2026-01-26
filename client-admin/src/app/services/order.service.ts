import { Injectable, signal, inject } from '@angular/core';
import { Food } from './food.service';
import { UserService } from './user.service';

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
  userService = inject(UserService);

  // Current pending order items
  orderItems = signal<OrderItem[]>([]);

  // Confirmed/Past orders
  activeOrders = signal<ConfirmedOrder[]>([]);

  // Currently selected item to display in left card
  selectedOrderItem = signal<OrderItem | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  // Confirm and place the current order
  confirmOrder(): boolean {
    const items = this.orderItems();
    if (items.length === 0) return false;

    const total = this.getTotal();

    // Process payment via UserService
    if (this.userService.processPayment(total)) {
      const newOrder: ConfirmedOrder = {
        id: Date.now().toString(36),
        items: [...items],
        total: total,
        date: new Date(),
        status: 'Cooking'
      };

      this.activeOrders.update(orders => {
        const updated = [newOrder, ...orders];
        this.saveActiveOrders(updated);
        return updated;
      });
      this.clearOrders();
      return true;
    } else {
      return false;
    }
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
  addItems(items: { food: Food, quantity: number }[]) {
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
  }

  // Persistence helpers
  private saveOrderItems(items: OrderItem[]) {
    localStorage.setItem('temp_order_items', JSON.stringify(items));
  }

  private saveActiveOrders(orders: ConfirmedOrder[]) {
    localStorage.setItem('user_orders', JSON.stringify(orders));
  }

  private loadFromStorage() {
    try {
      const tempItems = localStorage.getItem('temp_order_items');
      if (tempItems) {
        this.orderItems.set(JSON.parse(tempItems));
      }

      const userOrders = localStorage.getItem('user_orders');
      if (userOrders) {
        this.activeOrders.set(JSON.parse(userOrders));
      }
    } catch (e) {
      console.error('Failed to load orders from storage', e);
    }
  }
}
