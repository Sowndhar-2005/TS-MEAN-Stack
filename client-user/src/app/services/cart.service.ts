import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Food } from './food.service';
import { tap } from 'rxjs';

export interface CartItem {
  food: Food;
  quantity: number;
  customGroup?: string;
  instanceId: string;
  specialInstructions?: string;
}

interface CartResponse {
  cart: any;
  items: any[]; // items from backend where foodId is populated
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cart`;

  // Cart items with unique instanceIds allows same food in multiple groups
  cartItems = signal<CartItem[]>([]);

  constructor() {
    this.fetchCart();
  }

  // Refresh cart when user changes
  refreshUserData() {
    this.cartItems.set([]);
    this.fetchCart();
  }

  // Fetch cart from DB
  fetchCart() {
    this.http.get<CartResponse>(this.apiUrl).subscribe({
      next: (res) => this.updateLocalCart(res.items),
      error: (err) => console.error('Failed to fetch cart', err)
    });
  }

  // Add item to cart
  addToCart(food: Food, quantity: number = 1, customGroup?: string, specialInstructions?: string) {
    this.http.post<CartResponse>(`${this.apiUrl}/add`, {
      foodId: food._id,
      quantity,
      customGroup,
      specialInstructions
    }).subscribe({
      next: (res) => this.updateLocalCart(res.items),
      error: (err) => console.error('Failed to add to cart', err)
    });
  }

  // Update group members via bulk update
  updateGroup(groupName: string, instanceIds: string[]) {
    this.http.put<CartResponse>(`${this.apiUrl}/group`, {
      groupName,
      itemIds: instanceIds
    }).subscribe({
      next: (res) => this.updateLocalCart(res.items),
      error: (err) => console.error('Failed to update group', err)
    });
  }

  // Update quantity by Instance ID (which corresponds to backend item _id)
  updateQuantity(instanceId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(instanceId);
      return;
    }
    this.http.put<CartResponse>(`${this.apiUrl}/item/${instanceId}`, { quantity }).subscribe({
      next: (res) => this.updateLocalCart(res.items),
      error: (err) => console.error('Failed to update quantity', err)
    });
  }

  // Remove item by Instance ID
  removeItem(instanceId: string) {
    this.http.delete<CartResponse>(`${this.apiUrl}/item/${instanceId}`).subscribe({
      next: (res) => this.updateLocalCart(res.items),
      error: (err) => console.error('Failed to remove item', err)
    });
  }

  // Remove multiple items by Instance ID - Backend does not have batch delete yet, so sequentially call delete (or improvements later)
  // For now, to support placeOrder flow which removes items, we iterate.
  // Ideally, implemented as a backend endpoint (e.g., DELETE /cart/items { ids: [...] })
  removeItems(instanceIds: string[]) {
    // Use Promise.all to delete parallel, then fetch once (or rely on individual returns)
    // Since we want to update state, ideally we add a bulk delete endpoint. 
    // For now, let's implement a workaround: clear items one by one.
    // Optimistic update might be better for UI, but "DB only" request implies strictness.
    // We will add a simple loop.
    const deletes = instanceIds.map(id =>
      this.http.delete<CartResponse>(`${this.apiUrl}/item/${id}`).toPromise()
    );

    Promise.all(deletes).then(() => {
      this.fetchCart(); // Sync final state
    }).catch(err => console.error('Failed to remove items', err));
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
    this.http.delete<CartResponse>(`${this.apiUrl}/clear`).subscribe({
      next: (res) => this.updateLocalCart([]), // Clear local immediately or use res
      error: (err) => console.error('Failed to clear cart', err)
    });
  }

  private updateLocalCart(backendItems: any[]) {
    if (!backendItems || !Array.isArray(backendItems)) {
      console.warn('Invalid backend items received:', backendItems);
      return;
    }

    const items: CartItem[] = backendItems
      .filter(item => item && item.foodId) // Filter out invalid items
      .map(item => ({
        food: item.foodId, // Mapped because of populate('items.foodId')
        quantity: item.quantity,
        customGroup: item.customGroup || undefined,
        instanceId: item._id,
        specialInstructions: item.specialInstructions,
        price: item.price
      }));

    this.cartItems.set(items);
  }
}
