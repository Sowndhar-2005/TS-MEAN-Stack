import { Injectable, signal } from '@angular/core';
import { Food } from './food.service';

export interface CartItem {
  food: Food;
  quantity: number;
  customGroup?: string;
  instanceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Cart items with unique instanceIds allows same food in multiple groups
  cartItems = signal<CartItem[]>([]);

  // Add item to cart
  addToCart(food: Food, quantity: number = 1) {
    const currentCart = this.cartItems();
    // Check for existing item with SAME foodId AND NO customGroup (default bin)
    const existingIndex = currentCart.findIndex(item => item.food._id === food._id && !item.customGroup);

    if (existingIndex >= 0) {
      // Update existing item quantity
      const updatedCart = [...currentCart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + quantity
      };
      this.cartItems.set(updatedCart);
    } else {
      // Add new item with unique instanceId
      const newItem: CartItem = {
        food,
        quantity,
        instanceId: this.generateId()
      };
      this.cartItems.set([...currentCart, newItem]);
    }
  }

  // Update group members (handles add, remove, and partial updates)
  updateGroup(groupName: string, instanceIds: string[]) {
    const currentCart = this.cartItems();
    const updatedCart = currentCart.map(item => {
      // If this item is selected, assign it to the target group
      if (instanceIds.includes(item.instanceId)) {
        return { ...item, customGroup: groupName };
      }
      // If this item belonged to this group but is NOT selected anymore, ungroup it
      if (item.customGroup === groupName) {
        const { customGroup, ...rest } = item;
        return rest;
      }
      return item;
    });
    this.cartItems.set(updatedCart);
  }

  // Update quantity by Instance ID
  updateQuantity(instanceId: string, quantity: number) {
    const currentCart = this.cartItems();
    const updatedCart = currentCart
      .map(item => item.instanceId === instanceId ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0); // Remove if quantity is 0

    this.cartItems.set(updatedCart);
  }

  // Remove item by Instance ID
  removeItem(instanceId: string) {
    const currentCart = this.cartItems();
    this.cartItems.set(currentCart.filter(item => item.instanceId !== instanceId));
  }

  // Remove multiple items by Instance ID
  removeItems(instanceIds: string[]) {
    const currentCart = this.cartItems();
    this.cartItems.set(currentCart.filter(item => !instanceIds.includes(item.instanceId)));
  }

  // Get TOTAL quantity of a food type across all groups
  getQuantity(foodId: string): number {
    return this.cartItems()
      .filter(item => item.food._id === foodId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  // Calculate totals
  getSubtotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
  }

  getTax(): number {
    return Math.round(this.getSubtotal() * 0.05); // 5% tax
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  // Clear cart
  clearCart() {
    this.cartItems.set([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
