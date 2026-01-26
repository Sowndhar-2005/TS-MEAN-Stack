import { Router } from 'express';
import {
    getCart,
    addToCart,
    updateCartGroup,
    updateCartItem,
    removeFromCart,
    clearCart,
    createSharedCart,
    joinSharedCart,
} from '../controllers/cartController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/group', updateCartGroup);
router.put('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/share', createSharedCart);
router.post('/join/:sharedLink', joinSharedCart);

export default router;
