import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

export default router;
