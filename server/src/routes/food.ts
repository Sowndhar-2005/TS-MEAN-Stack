import { Router } from 'express';
import {
    getAllFoods,
    getFoodsByCategory,
    getFoodById,
    searchFoods,
    getCategoryCounts,
    updateStock,
} from '../controllers/foodController';

const router = Router();

// Public routes
router.get('/', getAllFoods);
router.get('/categories/counts', getCategoryCounts);
router.get('/search', searchFoods);
router.get('/category/:category', getFoodsByCategory);
router.get('/:id', getFoodById);

// Admin routes (for testing - would need auth in production)
router.put('/:id/stock', updateStock);

export default router;
