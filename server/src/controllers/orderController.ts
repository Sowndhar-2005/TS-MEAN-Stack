import { Response } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { User } from '../models/User';
import { Food } from '../models/Food';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { calculateOrderTotal } from '../utils/logicHelpers';

// Place order
export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paymentMethod, items: directItems } = req.body;
        let orderItems: any[] = [];
        let rawSubtotal = 0;

        if (directItems && Array.isArray(directItems) && directItems.length > 0) {
            // Direct Order (items provided in body)
            for (const item of directItems) {
                const food = await Food.findById(item.foodId || item.food?._id);
                if (!food) {
                    res.status(404).json({ error: `Food item not found: ${item.foodId}` });
                    return;
                }
                orderItems.push({
                    foodId: food._id,
                    name: food.name,
                    quantity: item.quantity,
                    price: food.price,
                    specialInstructions: item.specialInstructions,
                });
                rawSubtotal += food.price * item.quantity;
            }

            // Optional: Remove these items from cart if they exist there
            const cart = await Cart.findOne({ userId: req.user._id });
            if (cart) {
                const orderedFoodIds = orderItems.map(oi => oi.foodId.toString());
                cart.items = cart.items.filter(item => !orderedFoodIds.includes(item.foodId.toString()));
                await cart.save();
            }
        } else {
            // Cart-based Order
            const cart = await Cart.findOne({ userId: req.user._id }).populate('items.foodId');

            if (!cart || cart.items.length === 0) {
                res.status(400).json({ error: 'Cart is empty' });
                return;
            }

            orderItems = cart.items.map((item: any) => ({
                foodId: item.foodId._id,
                name: item.foodId.name,
                quantity: item.quantity,
                price: item.price,
                specialInstructions: item.specialInstructions,
            }));
            rawSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Clear cart after placing order
            cart.items = [];
            await cart.save();
        }

        // Calculate totals
        const { subtotal, tax, totalAmount } = calculateOrderTotal(rawSubtotal);

        // Get user
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Validate payment method and balance
        if (paymentMethod === 'wallet') {
            if (user.walletBalance < totalAmount) {
                res.status(400).json({ error: 'Insufficient wallet balance' });
                return;
            }
        } else if (paymentMethod === 'collegePoints') {
            if (user.collegePoints < totalAmount) {
                res.status(400).json({ error: 'Insufficient college points' });
                return;
            }
        }

        // Create order
        const order = new Order({
            userId: req.user._id,
            items: orderItems,
            subtotal,
            tax,
            totalAmount,
            paymentMethod,
            status: 'cooking',
            cookingStartTime: new Date(),
            estimatedReadyTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            cookingTimer: 15,
        });

        await order.save();

        // Deduct payment and update stats atomically
        const updateQuery: any = {
            $inc: {
                totalSpent: totalAmount,
                totalOrders: 1
            }
        };

        if (paymentMethod === 'wallet') {
            updateQuery.$inc.walletBalance = -totalAmount;
        } else if (paymentMethod === 'collegePoints') {
            updateQuery.$inc.collegePoints = -totalAmount;
        }

        await User.findByIdAndUpdate(req.user._id, updateQuery);

        // Create transaction record
        const transaction = new Transaction({
            userId: req.user._id,
            orderId: order._id,
            amount: totalAmount,
            type: 'debit',
            paymentMethod,
            status: 'completed',
            description: `Order ${order.orderId}`,
        });
        await transaction.save();

        // Update food stock
        for (const item of orderItems) {
            await Food.findByIdAndUpdate(item.foodId, {
                $inc: { stockQuantity: -item.quantity },
            });
        }

        // Update order with transaction ID
        order.transactionId = transaction._id.toString();
        order.paymentStatus = 'completed';
        await order.save();

        res.status(201).json({
            message: 'Order placed successfully',
            order,
            remainingBalance:
                paymentMethod === 'wallet'
                    ? (user.walletBalance - totalAmount)
                    : (paymentMethod === 'collegePoints' ? (user.collegePoints - totalAmount) : 0),
        });
    } catch (error: any) {
        console.error('Place order error:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
};

// Get user's orders
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Order.countDocuments({ userId: req.user._id });

        res.json({
            orders,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalOrders: total,
        });
    } catch (error: any) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            userId: req.user._id,
        });

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        // Calculate remaining cooking time
        if (order.status === 'cooking' && order.cookingStartTime && order.estimatedReadyTime) {
            const now = new Date();
            const remainingMs = order.estimatedReadyTime.getTime() - now.getTime();
            const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60000));

            res.json({
                order,
                remainingTime: remainingMinutes,
            });
            return;
        }

        res.json({ order });
    } catch (error: any) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
};

// Get current active order
export const getCurrentOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const order = await Order.findOne({
            userId: req.user._id,
            status: { $in: ['pending', 'cooking'] },
        }).sort({ createdAt: -1 });

        if (!order) {
            res.json({ order: null });
            return;
        }

        // Calculate remaining cooking time
        if (order.cookingStartTime && order.estimatedReadyTime) {
            const now = new Date();
            const remainingMs = order.estimatedReadyTime.getTime() - now.getTime();
            const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60000));

            res.json({
                order,
                remainingTime: remainingMinutes,
            });
            return;
        }

        res.json({ order });
    } catch (error: any) {
        console.error('Get current order error:', error);
        res.status(500).json({ error: 'Failed to get current order' });
    }
};
