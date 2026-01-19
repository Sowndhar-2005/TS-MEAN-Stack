import { Request, Response } from 'express';
import { Food } from '../models/Food';

// Get all food items
export const getAllFoods = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, search, available } = req.query;

        const filter: any = {};

        if (category) {
            filter.category = category;
        }

        if (available !== undefined) {
            filter.available = available === 'true';
        }

        let query = Food.find(filter);

        // Text search if search parameter provided
        if (search) {
            query = Food.find({
                $text: { $search: search as string },
                ...filter,
            });
        }

        const foods = await query.sort({ category: 1, name: 1 });

        res.json({ foods, count: foods.length });
    } catch (error: any) {
        console.error('Get foods error:', error);
        res.status(500).json({ error: 'Failed to get food items' });
    }
};

// Get foods by category
export const getFoodsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.params;

        const foods = await Food.find({
            category,
            available: true,
        }).sort({ name: 1 });

        res.json({ foods, count: foods.length });
    } catch (error: any) {
        console.error('Get foods by category error:', error);
        res.status(500).json({ error: 'Failed to get food items' });
    }
};

// Get food by ID
export const getFoodById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const food = await Food.findById(id);

        if (!food) {
            res.status(404).json({ error: 'Food item not found' });
            return;
        }

        res.json({ food });
    } catch (error: any) {
        console.error('Get food by ID error:', error);
        res.status(500).json({ error: 'Failed to get food item' });
    }
};

// Search foods
export const searchFoods = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        if (!q) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }

        const foods = await Food.find({
            $text: { $search: q as string },
            available: true,
        });

        res.json({ foods, count: foods.length });
    } catch (error: any) {
        console.error('Search foods error:', error);
        res.status(500).json({ error: 'Failed to search food items' });
    }
};

// Get categories with counts
export const getCategoryCounts = async (req: Request, res: Response): Promise<void> => {
    try {
        const counts = await Food.aggregate([
            { $match: { available: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);

        const categoryMap: any = {};
        counts.forEach((item) => {
            categoryMap[item._id] = item.count;
        });

        res.json({ categories: categoryMap });
    } catch (error: any) {
        console.error('Get category counts error:', error);
        res.status(500).json({ error: 'Failed to get category counts' });
    }
};

// Update stock (admin function - for testing)
export const updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { stockQuantity } = req.body;

        const food = await Food.findByIdAndUpdate(
            id,
            {
                stockQuantity,
                available: stockQuantity > 0,
            },
            { new: true }
        );

        if (!food) {
            res.status(404).json({ error: 'Food item not found' });
            return;
        }

        res.json({ message: 'Stock updated successfully', food });
    } catch (error: any) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
};
