import { Response } from 'express';
import { Cart } from '../models/Cart';
import { Food } from '../models/Food';
import { AuthRequest } from '../middleware/auth';
import { isUserInSharedCart } from '../utils/logicHelpers';
import crypto from 'crypto';

// Get user's cart
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.foodId');

        if (!cart) {
            res.json({ cart: null, items: [], total: 0 });
            return;
        }

        // Calculate total
        const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        res.json({ cart, items: cart.items, total });
    } catch (error: any) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
};

// Add item to cart
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { foodId, quantity, specialInstructions, customGroup } = req.body;

        // Validate food exists
        const food = await Food.findById(foodId);
        if (!food) {
            res.status(404).json({ error: 'Food item not found' });
            return;
        }

        if (!food.available || food.stockQuantity < quantity) {
            res.status(400).json({ error: 'Food item not available in requested quantity' });
            return;
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = new Cart({
                userId: req.user._id,
                items: [],
            });
        }

        // Check if item already exists in cart with same food, group, and instructions
        // Note: Comparing instructions can be tricky if they differ slightly, 
        // but typically we care about food + group for merging.
        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.foodId.toString() === foodId &&
                (item.customGroup || null) === (customGroup || null)
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
            if (specialInstructions) {
                cart.items[existingItemIndex].specialInstructions = specialInstructions;
            }
        } else {
            // Add new item
            cart.items.push({
                foodId,
                quantity,
                specialInstructions,
                customGroup: customGroup || null,
                price: food.price,
            });
        }

        await cart.save();
        await cart.populate('items.foodId');

        const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        res.json({
            message: 'Item added to cart',
            cart,
            items: cart.items,
            total,
        });
    } catch (error: any) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

// Update cart item quantity
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { itemId } = req.params;
        const { quantity, customGroup, specialInstructions } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            res.status(404).json({ error: 'Cart not found' });
            return;
        }

        const itemIndex = cart.items.findIndex((item) => item._id?.toString() === itemId);

        if (itemIndex === -1) {
            res.status(404).json({ error: 'Item not found in cart' });
            return;
        }

        // If quantity is provided and <= 0, remove item
        if (quantity !== undefined && quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Update fields if provided
            if (quantity !== undefined) cart.items[itemIndex].quantity = quantity;
            if (customGroup !== undefined) cart.items[itemIndex].customGroup = customGroup;
            if (specialInstructions !== undefined) cart.items[itemIndex].specialInstructions = specialInstructions;
        }

        await cart.save();
        await cart.populate('items.foodId');

        const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        res.json({
            message: 'Cart updated',
            cart,
            items: cart.items,
            total,
        });
    } catch (error: any) {
        console.error('Update cart item error:', error);
        res.status(500).json({ error: 'Failed to update cart item' });
    }
};

// Update cart group
export const updateCartGroup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { groupName, itemIds } = req.body; // itemIds is array of strings

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            res.status(404).json({ error: 'Cart not found' });
            return;
        }

        cart.items.forEach(item => {
            const itemId = item._id?.toString();
            if (itemId && itemIds.includes(itemId)) {
                // Assign to group
                item.customGroup = groupName;
            } else if (item.customGroup === groupName) {
                // If it was in this group but not in the new selection, remove it from group
                item.customGroup = null as any; // Cast to any to allow null if type is stringent, though helper allows it
            }
        });

        await cart.save();
        await cart.populate('items.foodId');

        const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        res.json({
            message: 'Cart group updated',
            cart,
            items: cart.items,
            total,
        });
    } catch (error: any) {
        console.error('Update cart group error:', error);
        res.status(500).json({ error: 'Failed to update cart group' });
    }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            res.status(404).json({ error: 'Cart not found' });
            return;
        }

        cart.items = cart.items.filter((item) => item._id?.toString() !== itemId);

        await cart.save();
        await cart.populate('items.foodId');

        const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        res.json({
            message: 'Item removed from cart',
            cart,
            items: cart.items,
            total,
        });
    } catch (error: any) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
};

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            res.status(404).json({ error: 'Cart not found' });
            return;
        }

        cart.items = [];
        await cart.save();

        res.json({ message: 'Cart cleared', cart });
    } catch (error: any) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

// Create shared cart link
export const createSharedCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ error: 'Cart is empty' });
            return;
        }

        // Generate unique shared link
        const sharedLink = crypto.randomBytes(16).toString('hex');
        cart.isShared = true;
        cart.sharedLink = sharedLink;

        await cart.save();

        res.json({
            message: 'Shared cart link created',
            sharedLink: `${process.env.CLIENT_URL}/invite/${sharedLink}`,
        });
    } catch (error: any) {
        console.error('Create shared cart error:', error);
        res.status(500).json({ error: 'Failed to create shared cart link' });
    }
};

// Join shared cart
export const joinSharedCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { sharedLink } = req.params;

        const cart = await Cart.findOne({ sharedLink }).populate('items.foodId');

        if (!cart) {
            res.status(404).json({ error: 'Shared cart not found' });
            return;
        }

        // Add user to shared cart participants
        if (!isUserInSharedCart(cart.sharedWith, req.user._id)) {
            cart.sharedWith.push(req.user._id);
            await cart.save();
        }

        res.json({
            message: 'Joined shared cart successfully',
            cart,
        });
    } catch (error: any) {
        console.error('Join shared cart error:', error);
        res.status(500).json({ error: 'Failed to join shared cart' });
    }
};
