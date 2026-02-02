import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    addPointsToUser,
    deductPointsFromUser,
    searchUsers,
    getDashboardStats,
    addWalletBalance,
    reduceWalletBalance,
    createUser,
    deleteUser
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminAuth';

const router = Router();

// All admin routes require authentication + admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.post('/users', createUser);
router.get('/users/:userId', getUserById);
router.delete('/users/:userId', deleteUser);

// Points management
router.post('/users/:userId/add-points', addPointsToUser);
router.post('/users/:userId/deduct-points', deductPointsFromUser);

// Wallet management
router.post('/users/:userId/add-wallet', addWalletBalance);
router.post('/users/:userId/reduce-wallet', reduceWalletBalance);

export default router;
