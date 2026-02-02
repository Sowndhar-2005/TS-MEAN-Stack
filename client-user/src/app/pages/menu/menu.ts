import { Component, signal, computed, OnInit, inject, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TopNavbar } from '../../shared/top-navbar/top-navbar';
import { FoodService } from '../../services/food.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, FormsModule, TopNavbar, NgOptimizedImage],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  foodService = inject(FoodService);
  orderService = inject(OrderService);
  cartService = inject(CartService);
  userService = inject(UserService);
  router = inject(Router);

  // Search query
  searchQuery = signal('');

  // Filters
  filterType = signal<'all' | 'veg' | 'non-veg'>('all');
  sortOrder = signal<'none' | 'asc' | 'desc'>('none');
  selectedTags = signal<string[]>([]);
  showFilters = signal(false);

  // Available tags from current foods (filtered by popular tags)
  availableTags = computed(() => {
    const popularTags = ['spicy', 'healthy', 'rice', 'south indian', 'north indian', 'chinese', 'biryani', 'beverage', 'ice cream', 'fried', 'gravy', 'dry', 'snacks', 'cool', 'hot'];
    const tags = new Set<string>();

    this.foodService.foods().forEach(food => {
      food.tags?.forEach(tag => {
        if (popularTags.includes(tag.toLowerCase())) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags).sort();
  });

  // Filtered and sorted foods (Used for specific category view and All items)
  filteredFoods = computed(() => {
    let foods = [...this.foodService.foods()];

    // 1. Filter by Type (Veg/Non-Veg)
    if (this.filterType() === 'veg') {
      foods = foods.filter(f => f.isVegetarian);
    } else if (this.filterType() === 'non-veg') {
      foods = foods.filter(f => !f.isVegetarian);
    }

    // 2. Filter by Tags
    if (this.selectedTags().length > 0) {
      foods = foods.filter(f =>
        this.selectedTags().some(tag => f.tags?.includes(tag))
      );
    }

    // 3. Sort by Price
    if (this.sortOrder() === 'asc') {
      foods.sort((a, b) => a.price - b.price);
    } else if (this.sortOrder() === 'desc') {
      foods.sort((a, b) => b.price - a.price);
    } else if (this.sortOrder() === 'none') {
      // Default Sort: By Category Order
      const categoryOrder = ['Breakfast', 'Lunch', 'Side Dish', 'Snacks', 'Drinks', 'Ice Cream', 'Dinner'];
      foods.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category);
        const indexB = categoryOrder.indexOf(b.category);
        // If category not found, push to end
        const safeIndexA = indexA === -1 ? 999 : indexA;
        const safeIndexB = indexB === -1 ? 999 : indexB;

        return safeIndexA - safeIndexB;
      });
    }

    return foods;
  });

  // Grouped foods for "All Items" view
  groupedFoods = computed(() => {
    const foods = this.filteredFoods();
    const groups: { category: string, items: any[] }[] = [];
    const categories = this.allCategories(); // Use dynamic categories

    categories.forEach(cat => {
      const catFoods = foods.filter(f => f.category === cat);
      if (catFoods.length > 0) {
        groups.push({ category: cat, items: catFoods });
      }
    });

    return groups;
  });

  // Toggle filter visibility
  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  // Set filter type
  setFilterType(type: 'all' | 'veg' | 'non-veg') {
    this.filterType.set(type);
  }

  // Set sort order
  setSortOrder(order: 'none' | 'asc' | 'desc') {
    this.sortOrder.set(order);
  }

  // Toggle tag selection
  toggleTag(tag: string) {
    this.selectedTags.update(tags => {
      if (tags.includes(tag)) {
        return tags.filter(t => t !== tag);
      } else {
        return [...tags, tag];
      }
    });
  }

  // Clear all filters
  clearFilters() {
    this.filterType.set('all');
    this.sortOrder.set('none');
    this.selectedTags.set([]);
  }

  // Cart state
  cart = signal<Map<string, number>>(new Map());

  // Categories
  allCategories = computed(() => {
    const baseCategories = ['Breakfast', 'Lunch', 'Side Dish', 'Snacks', 'Drinks', 'Ice Cream'];
    if (this.userService.currentUser()?.userType === 'hosteller') {
      baseCategories.push('Dinner');
    }
    return baseCategories;
  });

  // Computed cart item count
  cartItemCount = computed(() => {
    let total = 0;
    this.cart().forEach(qty => total += qty);
    return total;
  });

  ngOnInit() {
    // Load all foods on init
    this.foodService.getAllFoods();

    // 1. Check local storage for persistence
    const savedCategory = localStorage.getItem('selected_category');

    // 2. Or determine based on time if no saved preference
    let targetCategory = '';
    if (savedCategory !== null) {
      targetCategory = savedCategory;
    } else {
      targetCategory = this.getTimeBasedCategory();
    }

    this.selectCategory(targetCategory);
  }

  getTimeBasedCategory(): string {
    const hour = new Date().getHours();
    // Logic Refinement:
    // < 8:00 - 11:00 -> Breakfast
    // 11:00 - 15:00 -> Lunch
    // 15:00 - 18:00 -> Snacks
    // 18:00 - 20:00 -> Dinner (if hosteller)
    // Else -> Default/All (usually implies < 8:00 AM or > 20:00 PM)

    if (hour >= 8 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Snacks';
    if (hour >= 18 && hour < 20) {
      if (this.userService.currentUser()?.userType === 'hosteller') {
        return 'Dinner';
      }
      return 'Snacks';
    }

    // Default to 'All Items' for late night / early morning
    return '';
  }


  // Select category
  selectCategory(category: string) {
    this.foodService.selectedCategory.set(category);
    localStorage.setItem('selected_category', category); // Persist

    // Clear tag filters when changing categories to avoid empty results
    this.selectedTags.set([]);
    if (category) {
      this.foodService.loadFoodsByCategory(category);
    } else {
      this.foodService.getAllFoods();
    }
  }

  // Get count for a specific category
  getCategoryCount(category: string): number {
    const counts = this.foodService.categoryCounts();
    return counts[category] || 0;
  }

  // Get quantity from cart
  getQuantity(foodId: string): number {
    return this.cart().get(foodId) || 0;
  }

  // Add to cart
  addToCart(foodId: string) {
    const currentCart = new Map(this.cart());
    const currentQty = currentCart.get(foodId) || 0;
    currentCart.set(foodId, currentQty + 1);
    this.cart.set(currentCart);
  }

  // Remove from cart
  removeFromCart(foodId: string) {
    const currentCart = new Map(this.cart());
    const currentQty = currentCart.get(foodId) || 0;
    if (currentQty > 0) {
      if (currentQty === 1) {
        currentCart.delete(foodId);
      } else {
        currentCart.set(foodId, currentQty - 1);
      }
      this.cart.set(currentCart);
    }
  }

  // Update search
  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.foodService.searchQuery.set(value);
    this.foodService.searchFoods(value);
  }

  // Get category icon
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Breakfast': 'sunrise',
      'Lunch': 'sun',
      'Side Dish': 'egg-fried',
      'Snacks': 'cookie',
      'Drinks': 'cup-straw',
      'Dinner': 'moon-stars-fill',
      'Ice Cream': 'snow'
    };
    return icons[category] || 'cup-hot';
  }

  // Order now - add to order and show success message
  orderNow(food: any) {
    const quantity = this.getQuantity(food._id) || 1;
    this.orderService.addToOrder(food, quantity);

    // Show success toast
    this.showToast(`${food.name} added to order! (${quantity}x)`);

    // Reset quantity in cart
    this.removeFromCart(food._id);

    // Navigate to orders page
    // this.router.navigate(['/orders']);
  }

  // Add to cart and navigate
  addToCartAndNavigate(food: any) {
    const quantity = this.getCartQuantity(food._id) || 1;
    this.cartService.addToCart(food, quantity);
    this.router.navigate(['/cart']);
  }

  // Get cart quantity
  getCartQuantity(foodId: string): number {
    return this.cartService.getQuantity(foodId);
  }

  // Add to cart (without navigation)
  addToCartItem(food: any, quantity: number = 1) {
    this.cartService.addToCart(food, quantity);
    this.showToast(`${food.name} added to cart!`);
  }

  // Remove from cart
  removeFromCartItem(foodId: string) {
    this.cartService.removeItem(foodId);
  }

  // Update cart quantity
  updateCartQuantity(foodId: string, delta: number) {
    const currentQty = this.cartService.getQuantity(foodId);
    const newQty = Math.max(0, currentQty + delta);
    this.cartService.updateQuantity(foodId, newQty);
  }

  // Show toast notification
  showToast(message: string) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'position-fixed top-0 start-50 translate-middle-x mt-5 alert alert-success alert-dismissible fade show shadow-lg';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 150);
    }, 3000);
  }
}
