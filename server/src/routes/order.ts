import { Router } from 'express';
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    getCurrentOrder,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.use(authMiddleware);

router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.get('/current', getCurrentOrder);
router.get('/:id', getOrderById);

export default router;
