import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TopNavbar } from '../../shared/top-navbar/top-navbar';
import { OrderService, OrderItem } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { FoodService, Food } from '../../services/food.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule, TopNavbar],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  @ViewChild('suggestionsContainer') suggestionsContainer!: ElementRef<HTMLDivElement>;

  orderService = inject(OrderService);
  cartService = inject(CartService);
  foodService = inject(FoodService);
  router = inject(Router);

  // Grouping state
  isGrouped = signal(false);

  // Grouped Order Items
  orderGroups = computed(() => {
    const items = this.orderService.orderItems();
    const groups = new Map<string, { items: OrderItem[], total: number }>();

    items.forEach(item => {
      const category = item.food.category || 'Other';
      if (!groups.has(category)) {
        groups.set(category, { items: [], total: 0 });
      }
      const group = groups.get(category)!;
      group.items.push(item);
      group.total += item.food.price * item.quantity;
    });

    return Array.from(groups.entries()).map(([name, data]) => ({
      name,
      items: data.items,
      total: data.total
    }));
  });

  // Suggested Foods Logic
  suggestedFoods = computed(() => {
    const currentItems = this.orderService.orderItems();
    const allFoods = this.foodService.allFoods();

    // Logic to combine categories based on content
    const categoriesToShow = new Set<string>();

    // Check what we have
    const hasMainMeal = currentItems.some(i => ['Breakfast', 'Lunch', 'Dinner'].includes(i.food.category));
    const hasSnacks = currentItems.some(i => i.food.category === 'Snacks');
    const hasDrinks = currentItems.some(i => i.food.category === 'Drinks');

    if (hasMainMeal) {
      // Valid combos for meals: Side Dish + Drinks + Ice Cream
      categoriesToShow.add('Side Dish');
      categoriesToShow.add('Drinks');
      categoriesToShow.add('Ice Cream');
    }

    if (hasSnacks) {
      // Valid for snacks: Drinks + Ice Cream + More Snacks
      categoriesToShow.add('Drinks');
      categoriesToShow.add('Ice Cream');
    }

    if (hasDrinks && !hasMainMeal && !hasSnacks) {
      // Just drinks? Add Snacks
      categoriesToShow.add('Snacks');
    }

    // Default (Empty or no matches): Show broad variety
    if (categoriesToShow.size === 0) {
      // "Suggested for You" - Mix of Snacks, Drinks, Ice Cream
      categoriesToShow.add('Snacks');
      categoriesToShow.add('Drinks');
      categoriesToShow.add('Ice Cream');
    }

    // Return foods from these categories, shuffled to mix them up
    let suggestions = allFoods.filter(f => categoriesToShow.has(f.category));

    // Simple shuffle (Fisher-Yates) to mix categories
    for (let i = suggestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [suggestions[i], suggestions[j]] = [suggestions[j], suggestions[i]];
    }

    return suggestions;
  });

  suggestedTitle = computed(() => {
    const currentItems = this.orderService.orderItems();
    const hasMainMeal = currentItems.some(i => ['Breakfast', 'Lunch', 'Dinner'].includes(i.food.category));
    const hasSnacks = currentItems.some(i => i.food.category === 'Snacks');

    if (hasMainMeal && hasSnacks) return 'Complete Your Meal & Refreshments';
    if (hasMainMeal) return 'Side Dishes, Drinks & Desserts'; // More descriptive title for combos
    if (hasSnacks) return 'Drinks & Treats to Go';
    if (currentItems.length === 0) return 'Popular Picks for You';
    return 'Chef\'s Recommended Combinations';
  });

  toggleGrouping() {
    this.isGrouped.update(v => !v);
  }

  ngOnInit() {
    // Load foods for suggestions
    if (this.foodService.allFoods().length === 0) {
      this.foodService.getAllFoods();
    }

    // Set list title from group name if available
    const groupName = this.orderService.orderGroupName();
    if (groupName) {
      this.listTitle.set(groupName);
    }

    // If no items, select the first one
    if (this.orderService.orderItems().length > 0 && !this.orderService.selectedOrderItem()) {
      this.orderService.selectOrderItem(this.orderService.orderItems()[0]);
    }
  }

  // Select item to view in left card
  selectItem(item: OrderItem) {
    this.orderService.selectOrderItem(item);
  }

  // Update quantity for selected item
  updateSelectedQuantity(delta: number) {
    const selected = this.orderService.selectedOrderItem();
    if (selected) {
      const newQuantity = Math.max(1, selected.quantity + delta);
      this.orderService.updateQuantity(selected.food._id, newQuantity);
    }
  }

  // Remove item from order
  removeItem(foodId: string, event: Event) {
    event.stopPropagation(); // Prevent selecting the item
    this.orderService.removeItem(foodId);
  }

  // Add selected item to cart
  addToCart(item?: OrderItem) {
    const targetItem = item || this.orderService.selectedOrderItem();
    if (targetItem) {
      this.cartService.addToCart(targetItem.food, targetItem.quantity);
      alert('Added to cart!');
    }
  }

  // Quick Add from Suggestion
  addSuggestion(food: Food) {
    // Check if already in order
    const existing = this.orderService.orderItems().find(i => i.food._id === food._id);
    if (existing) {
      this.orderService.updateQuantity(food._id, existing.quantity + 1);
    } else {
      this.orderService.addToOrder(food);
    }
  }

  // Scroll Suggestions
  scrollSuggestions(direction: 'left' | 'right') {
    if (this.suggestionsContainer) {
      const container = this.suggestionsContainer.nativeElement;
      const scrollAmount = 300; // Scroll by card width + gap
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }

  // Pay and confirm order
  payOrder() {
    if (this.orderService.orderItems().length === 0) return;
    this.showPaymentModal = true;
  }

  // Payment Modal State
  showPaymentModal = false;
  userService = inject(UserService);

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  processPayment(method: 'WALLET' | 'UPI') {
    // Confirm order with selected method
    const success = this.orderService.confirmOrder(method);

    if (success) {
      const methodText = method === 'WALLET' ? 'Wallet' : 'UPI';
      alert(`Order placed successfully using ${methodText}!`);
      this.closePaymentModal();
      this.router.navigate(['/orders']); // Maybe stay on page or go to history
    } else {
      alert('Payment Failed: Insufficient Balance or Error.');
    }
  }

  // List Title
  // List Title
  listTitle = signal('My Order');

  // Add all items in list to cart
  addListToCart() {
    const items = this.orderService.orderItems();
    if (items.length === 0) return;

    // 1. Add all items to cart (this might be duplicate if already in cart, but acceptable for now)
    items.forEach(item => {
      this.cartService.addToCart(item.food, item.quantity);
    });

    // 2. If title provided, group them
    const title = this.listTitle().trim();
    if (title) {
      const itemIds = items.map(i => i.food._id);
      this.cartService.updateGroup(title, itemIds);
    }

    alert('Order added to cart!');
    this.orderService.clearOrders();
  }

  // Navigate to menu to add more items
  navigateToMenu() {
    this.router.navigate(['/menu']);
  }
}
