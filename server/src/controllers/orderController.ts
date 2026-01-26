import { Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { User } from '../models/User';
import { Food } from '../models/Food';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { calculateOrderTotal } from '../utils/logicHelpers';

// Place order
export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { paymentMethod, items: directItems } = req.body;
        let orderItems: any[] = [];
        let rawSubtotal = 0;

        // 1. Prepare Order Items and Validate Stock
        if (directItems && Array.isArray(directItems) && directItems.length > 0) {
            // Direct Order (items provided in body)
            for (const item of directItems) {
                const foodId = item.foodId || item.food?._id;
                const food = await Food.findById(foodId).session(session);

                if (!food) {
                    throw new Error(`Food item not found: ${foodId}`);
                }
                if (!food.available || food.stockQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for item: ${food.name}`);
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
            const cart = await Cart.findOne({ userId: req.user._id }).session(session);
            if (cart) {
                const orderedFoodIds = orderItems.map(oi => oi.foodId.toString());
                cart.items = cart.items.filter(item => !orderedFoodIds.includes(item.foodId.toString()));
                await cart.save({ session });
            }
        } else {
            // Cart-based Order
            const cart = await Cart.findOne({ userId: req.user._id }).populate('items.foodId').session(session);

            if (!cart || cart.items.length === 0) {
                throw new Error('Cart is empty');
            }

            for (const item of cart.items) {
                const food: any = item.foodId;

                // Fetch fresh Food document to ensure latest stock
                const freshFood = await Food.findById(food._id).session(session);

                if (!freshFood) {
                    throw new Error(`Food not found: ${food.name}`);
                }
                if (!freshFood.available || freshFood.stockQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for item: ${freshFood.name}`);
                }

                orderItems.push({
                    foodId: freshFood._id,
                    name: freshFood.name,
                    quantity: item.quantity,
                    price: freshFood.price,
                    specialInstructions: item.specialInstructions,
                });
                rawSubtotal += freshFood.price * item.quantity;
            }

            // Clear cart after placing order
            cart.items = [];
            await cart.save({ session });
        }

        // 2. Calculate totals
        const { subtotal, tax, totalAmount } = calculateOrderTotal(rawSubtotal);

        // 3. Validate payment method and balance
        const user = await User.findById(req.user._id).session(session);
        if (!user) {
            throw new Error('User not found');
        }

        if (paymentMethod === 'wallet') {
            if (user.walletBalance < totalAmount) {
                throw new Error('Insufficient wallet balance');
            }
        } else if (paymentMethod === 'collegePoints') {
            if (user.collegePoints < totalAmount) {
                throw new Error('Insufficient college points');
            }
        }

        // 4. Create order
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

        await order.save({ session });

        // 5. Deduct payment and update stats
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

        await User.findByIdAndUpdate(req.user._id, updateQuery, { session });

        // 6. Create transaction record
        const transaction = new Transaction({
            userId: req.user._id,
            orderId: order._id,
            amount: totalAmount,
            type: 'debit',
            paymentMethod,
            status: 'completed',
            description: `Order ${order.orderId || order._id}`,
        });
        await transaction.save({ session });

        // 7. Update food stock (Optimized: BulkWrite)
        const bulkOps = orderItems.map(item => ({
            updateOne: {
                filter: { _id: item.foodId },
                update: { $inc: { stockQuantity: -item.quantity } }
            }
        }));

        if (bulkOps.length > 0) {
            await Food.bulkWrite(bulkOps, { session });
        }

        // 8. Update order with transaction ID
        order.transactionId = transaction._id.toString();
        order.paymentStatus = 'completed';
        await order.save({ session });

        // Commit Transaction
        await session.commitTransaction();

        res.status(201).json({
            message: 'Order placed successfully',
            order,
            remainingBalance:
                paymentMethod === 'wallet'
                    ? (user.walletBalance - totalAmount)
                    : (paymentMethod === 'collegePoints' ? (user.collegePoints - totalAmount) : 0),
        });
    } catch (error: any) {
        // Abort Transaction
        await session.abortTransaction();
        console.error('Place order error:', error);

        const errorMessage = error.message || 'Failed to place order';
        // Determine status code based on error type
        const statusCode = errorMessage.includes('Insufficient') || errorMessage.includes('Cart is empty') ? 400 : 500;

        res.status(statusCode).json({ error: errorMessage });
    } finally {
        session.endSession();
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
