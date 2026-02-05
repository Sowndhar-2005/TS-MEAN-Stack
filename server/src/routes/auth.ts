import { Router } from 'express';
import { login, adminLogin, getMe, updateProfile, markNotificationsAsRead } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/notifications/read', authMiddleware, markNotificationsAsRead);

export default router;
