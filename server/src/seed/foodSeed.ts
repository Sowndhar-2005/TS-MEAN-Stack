import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Food } from '../models/Food';

dotenv.config();

const foodItems = [
    {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken pieces',
        price: 120,
        category: 'Lunch',
        stockQuantity: 24,
        rating: 4.5,
        isVegetarian: false,
        tags: ['rice', 'spicy', 'popular'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATeBE0gd827NLa1L-EEKGkWmAG2OMsNfhOul8yX1vyFNOZ2_mrouiunPDm5V0H4ZUp5meLIArHgmlE2zglih_iDE_76eFILZTW8BFB3P5TKgO1pZ3Pp2VOkldSBtqVV0b3Fj2F0wDYZ--8mXBtmRTftbWzBN2S_eUSNQbDY8P4YT81qK8jZaShqepCuUJhVO_DOI8-RIqoMpX6kap1NhUsUwVKlTpPIrXTlPM9ISTzAiTHLHqnt7NHEeJErUne76q8b0p2PbCHj4k',
    },
    {
        name: 'Masala Dosa',
        description: 'Crispy rice crepe with spiced potato filling',
        price: 60,
        category: 'Breakfast',
        stockQuantity: 2,
        rating: 4.7,
        isVegetarian: true,
        tags: ['south indian', 'crispy', 'traditional'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDghLix_cEG4vw7bxEMcoMULZgNmRRFTDQ1gETUXT7Tf8_SPm7RUpZmc5_s6rhS43nfLlZ0MwDyb5ieNi2e_HaXImGc63DkNx7dECTQrS7pZ-u1932w_bdLa6pR90Mv9Hjkg8izKmOrjDzY_tInb3YskbLL4qQQoWs4yZg2xBm8wYijdXkufsfK7nKiR2ZNV3GWShYn5bizVLgA40_gUBYQ6uD332KIJVn70k_UOlxojZA9jr9NS0xqGLD4jH6k5R7rqRB4BW6xInU',
    },
    {
        name: 'Veg Burger',
        description: 'Grilled veggie patty with fresh vegetables',
        price: 85,
        category: 'Snacks',
        stockQuantity: 15,
        rating: 4.2,
        isVegetarian: true,
        tags: ['burger', 'healthy', 'vegetarian'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLLKfmAdn-odOdV06UBfHD8i1TtOx5566-6upsMPBJBPDa1O6NT1Zvg8BKmHG2OGZPhEHx35hwfyjGeUa9puYcz9yylu4-N7CA6BAc0F6mPRdUXU7EiXKga6oySq1ztoleqDa_j0X-CT4ynxdvtFQoulJDk16Q4uAiOTfOUn07lCk2Uzhg5uvInUlgIWaYKiTaIyro3zU27wtJlIAPxmJe3GbFRMapZEgZ_umerH72yZiO_jrwIsgmVEHhBeeVHaw_p_O37vk41uA',
    },
    {
        name: 'Paneer Butter Masala',
        description: 'Rich and creamy paneer curry',
        price: 140,
        category: 'Lunch',
        stockQuantity: 12,
        rating: 4.8,
        isVegetarian: true,
        tags: ['curry', 'creamy', 'popular'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASWFQlWuTESCHRoPoIH3QfUuuClaGVQdV2ZJJMQpRlETupnNGN4hh0ylYFuaree1j8J6xzjrAgBj2l_-wPIFS5GQNBtldsxmQkEE-cCFtazz_djoKkV_b5f3MTWJ6586p2lUTbYWoHxW2KCSnmpyO1nimZdiH-DV5xMQckXU4E7QkuqxJ_KkjZ0Yu-ArXT-INuo0K7zorar_2WeCmSV85z4a4xW_hZwPIsSiRN4DBtR1jmUPK5GEruP-0rN_SWKI4iECw2R1M2G7k',
    },
    {
        name: 'Cold Coffee',
        description: 'Refreshing iced coffee with milk',
        price: 40,
        category: 'Drinks',
        stockQuantity: 20,
        rating: 4.3,
        isVegetarian: true,
        tags: ['beverage', 'cold', 'coffee'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV4SC6qEClehBkXGdyCjzw7byTo5y36bcUvTr0TD2pUML6Vzo7MjZFkBQG6pReB3LLBDpJh-3YPs5w4-UeQxfa5QVT-8ClIyJmhvPNM3RAqQhoeI_PlHHsAOh2JuswQHntkxRRulKXuBvzen5WVIkaAF6C4RoECuENnnTB0hq72iWSb5-yRMibK1uyJny1CErcrPdqLG91caCYH0JKrd-wbvQ6Vsdt2hKsxYw5eBQU1skFwfPAQgbbFU8LH-zX9YSXVgzhkza_oO8',
    },
    {
        name: 'North Indian Thali',
        description: 'Complete meal with dal, roti, rice, and vegetables',
        price: 180,
        category: 'Lunch',
        stockQuantity: 10,
        rating: 4.9,
        isVegetarian: true,
        tags: ['thali', 'complete meal', 'traditional'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP0bvskw_KJGar9-F5s62ab_py2RrKqY2qUpDdsR1cqd-bIaCfqXB6jc0NLXXCGpKu8jE3V0LPe2aWzghEdYSBIByKoxtUHB5nX7GqhujOXVRS0KkONnZbF_NoLbocENy8T5gabg3o_0xGa0hlHl2SnHctHxflfZmPIeBdlPtmqZfhYzmbshh--uIWrDt1aptLceN7YlVE-uRXfV9dil2LxiKKULaEkmYMvtVGD6r5hKm2thQKEZ0s4pkqTBGMfnQwYAI50mRUFWI',
    },
    {
        name: 'Chicken Sandwich',
        description: 'Grilled chicken with fresh vegetables',
        price: 95,
        category: 'Snacks',
        stockQuantity: 18,
        rating: 4.4,
        isVegetarian: false,
        tags: ['sandwich', 'chicken', 'quick'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TuxZ0NCMWz_gywyTOp_Tmk-NipQXicxyzAnl8hv9JYdTTzVzp1vCn8nFZreV2M8AW0altwDU50yAPeIIdKF2o7NgKgg-2ZD_JRmBjGdNrwH4GMSPDuSVz88mYMW5NOk4_3j-jpklQ-qIQIRdiJV4ddvVZVR2hrtSgcIxAnTDAPZvWXbBO3buloETTyi3SDZ0QwNBR9rCX06v00HlnBTp-RLm5MifErHZQvueQyCK1H1WbUcB3h2LPIL9C-tyQJFSEbMvhCDaY24',
    },
    {
        name: 'Fruit Salad',
        description: 'Fresh seasonal fruits with honey',
        price: 70,
        category: 'Snacks',
        stockQuantity: 15,
        rating: 4.6,
        isVegetarian: true,
        tags: ['healthy', 'fresh', 'fruits'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLS6GtuHFhe1Y-LGqR4ZZhyPYCtaib7KPp0HG_0qAdMRkAAyUU0JE8_x4EIdjCF8gJMbdx0smmyhVaQsp3XPf69pk_96mWlxRW1tQ7Ua5C75vD5iFeIic0Hh5KqMb3os0khv7fVSzU2lEwvZk_D1A9L7jatdatoflChy3Vhd9gmMw34-hF9b8MK01QlQINMiOEEha3lzkLwdPp8HOcoP-6OHKQr1XCsjO7fSxIVp2oDjvHZR9mwkfru3Hldg1GO_KfDwCAhK1DdfE',
    },
    {
        name: 'Idli Sambar',
        description: 'Steamed rice cakes with lentil soup',
        price: 50,
        category: 'Breakfast',
        stockQuantity: 30,
        rating: 4.5,
        isVegetarian: true,
        tags: ['south indian', 'healthy', 'light'],
    },
    {
        name: 'Vada Pav',
        description: 'Spicy potato fritter in a bun',
        price: 35,
        category: 'Snacks',
        stockQuantity: 25,
        rating: 4.3,
        isVegetarian: true,
        tags: ['street food', 'spicy', 'quick'],
    },
    {
        name: 'Samosa (2 pcs)',
        description: 'Crispy pastry filled with spiced potatoes',
        price: 40,
        category: 'Snacks',
        stockQuantity: 30,
        rating: 4.6,
        isVegetarian: true,
        tags: ['crispy', 'spicy', 'popular'],
    },
    {
        name: 'Chai (Tea)',
        description: 'Hot Indian spiced tea',
        price: 15,
        category: 'Drinks',
        stockQuantity: 50,
        rating: 4.7,
        isVegetarian: true,
        tags: ['hot', 'beverage', 'refreshing'],
    },
];

const seedDatabase = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-canteen';

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing food items
        await Food.deleteMany({});
        console.log('🗑️  Cleared existing food items');

        // Insert seed data
        await Food.insertMany(foodItems);
        console.log(`✅ Inserted ${foodItems.length} food items`);

        // Display categories
        const categories = await Food.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);

        console.log('\n📊 Food items by category:');
        categories.forEach((cat) => {
            console.log(`  - ${cat._id}: ${cat.count} items`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
