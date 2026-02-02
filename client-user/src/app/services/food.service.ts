import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

export interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  stockQuantity: number; // Match backend field name
  rating?: number;
  isVegetarian: boolean; // Match backend field name
  tags?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private apiUrl = `${environment.apiUrl}/food`;

  // Signals
  foods = signal<Food[]>([]);
  allFoods = signal<Food[]>([]); // Store all foods for counts
  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');

  // Computed category counts
  categoryCounts = computed(() => {
    const counts: { [key: string]: number } = {};
    const foodsArray = this.allFoods(); // Use allFoods for counts

    // Ensure we have an array
    if (!Array.isArray(foodsArray)) {
      return counts;
    }

    foodsArray.forEach(food => {
      if (food && food.category) {
        counts[food.category] = (counts[food.category] || 0) + 1;
      }
    });
    return counts;
  });

  constructor(private http: HttpClient) { }

  // Get all foods
  getAllFoods(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        // Handle both direct array and wrapped response
        const foodsData = Array.isArray(response) ? response : (response.data || response.foods || []);
        this.foods.set(foodsData);
        this.allFoods.set(foodsData); // Update cache for counts
      },
      error: (error) => {
        console.error('Error loading foods:', error);
        this.foods.set([]); // Set empty array on error
        // Don't clear allFoods on error to keep existing counts if any
      }
    });
  }

  // Load foods by category
  loadFoodsByCategory(category: string): void {
    // Use query parameter instead of path parameter
    const url = `${this.apiUrl}?category=${category}`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        const foodsData = Array.isArray(response) ? response : (response.data || response.foods || []);
        this.foods.set(foodsData);
      },
      error: (error) => {
        console.error('Error loading foods:', error);
        this.foods.set([]);
      }
    });
  }

  // Search foods
  searchFoods(query: string): void {
    if (!query) {
      if (this.selectedCategory()) {
        this.loadFoodsByCategory(this.selectedCategory());
      } else {
        this.getAllFoods();
      }
      return;
    }

    this.http.get<any>(`${this.apiUrl}/search?q=${query}`).subscribe({
      next: (response) => {
        const foodsData = Array.isArray(response) ? response : (response.data || response.foods || []);
        this.foods.set(foodsData);
      },
      error: (error) => {
        console.error('Error searching foods:', error);
        this.foods.set([]);
      }
    });
  }
}
