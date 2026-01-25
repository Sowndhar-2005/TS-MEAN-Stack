import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get all users (admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find({ isAdmin: false }).select('-password').sort({ createdAt: -1 });

        // DEBUG: Check values from DB
        console.log('[DEBUG] First 3 users stats:', users.slice(0, 3).map(u => ({
            name: u.name,
            reg: u.registrationNumber,
            orders: u.totalOrders,
            spent: u.totalSpent
        })));

        res.json({
            message: 'Users retrieved successfully',
            count: users.length,
            users: users.map((user) => ({
                id: user._id,
                name: user.name,
                email: user.email,
                registrationNumber: user.registrationNumber,
                userType: user.userType,
                department: user.department,
                year: user.year,
                walletBalance: user.walletBalance,
                collegePoints: user.collegePoints,
                totalSpent: user.totalSpent,
                totalOrders: user.totalOrders,
                createdAt: user.createdAt,
            })),
        });
    } catch (error: any) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

// Get single user by ID (admin only)
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            registrationNumber: user.registrationNumber,
            userType: user.userType,
            department: user.department,
            year: user.year,
            walletBalance: user.walletBalance,
            collegePoints: user.collegePoints,
            totalSpent: user.totalSpent,
            totalOrders: user.totalOrders,
            savedCombos: user.savedCombos,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    } catch (error: any) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
};

// Add points to a user (admin only)
export const addPointsToUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { points, reason } = req.body;

        // Validate points
        if (!points || typeof points !== 'number' || points <= 0) {
            res.status(400).json({ error: 'Points must be a positive number' });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Add points to user
        user.collegePoints += points;
        await user.save();

        console.log(`[ADMIN] Added ${points} points to user ${user.name} (${user.registrationNumber}). Reason: ${reason || 'Not specified'}`);

        res.json({
            message: 'Points added successfully',
            user: {
                id: user._id,
                name: user.name,
                registrationNumber: user.registrationNumber,
                collegePoints: user.collegePoints,
            },
            pointsAdded: points,
            reason: reason || 'Not specified',
        });
    } catch (error: any) {
        console.error('Add points error:', error);
        res.status(500).json({ error: 'Failed to add points' });
    }
};

// Deduct points from a user (admin only)
export const deductPointsFromUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { points, reason } = req.body;

        // Validate points
        if (!points || typeof points !== 'number' || points <= 0) {
            res.status(400).json({ error: 'Points must be a positive number' });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if user has enough points
        if (user.collegePoints < points) {
            res.status(400).json({
                error: 'Insufficient points',
                currentPoints: user.collegePoints,
                requestedDeduction: points
            });
            return;
        }

        // Deduct points from user
        user.collegePoints -= points;
        await user.save();

        console.log(`[ADMIN] Deducted ${points} points from user ${user.name} (${user.registrationNumber}). Reason: ${reason || 'Not specified'}`);

        res.json({
            message: 'Points deducted successfully',
            user: {
                id: user._id,
                name: user.name,
                registrationNumber: user.registrationNumber,
                collegePoints: user.collegePoints,
            },
            pointsDeducted: points,
            reason: reason || 'Not specified',
        });
    } catch (error: any) {
        console.error('Deduct points error:', error);
        res.status(500).json({ error: 'Failed to deduct points' });
    }
};

// Search users (admin only)
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }

        const searchRegex = new RegExp(query, 'i');

        const users = await User.find({
            isAdmin: false,
            $or: [
                { name: searchRegex },
                { email: searchRegex },
                { registrationNumber: searchRegex },
                { department: searchRegex },
            ],
        }).select('-password').limit(20);

        res.json({
            message: 'Search completed',
            count: users.length,
            users: users.map((user) => ({
                id: user._id,
                name: user.name,
                email: user.email,
                registrationNumber: user.registrationNumber,
                userType: user.userType,
                department: user.department,
                year: user.year,
                collegePoints: user.collegePoints,
            })),
        });
    } catch (error: any) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};

// Get admin dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments({ isAdmin: false });
        const totalDayScholars = await User.countDocuments({ isAdmin: false, userType: 'dayscholar' });
        const totalHostellers = await User.countDocuments({ isAdmin: false, userType: 'hosteller' });

        // Get total points distributed
        const pointsAggregation = await User.aggregate([
            { $match: { isAdmin: false } },
            { $group: { _id: null, totalPoints: { $sum: '$collegePoints' } } }
        ]);
        const totalPointsDistributed = pointsAggregation[0]?.totalPoints || 0;

        // Get recent users (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const recentUsers = await User.countDocuments({
            isAdmin: false,
            createdAt: { $gte: lastWeek }
        });

        res.json({
            totalUsers,
            totalDayScholars,
            totalHostellers,
            totalPointsDistributed,
            recentUsers,
        });
    } catch (error: any) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
};
// Add wallet balance to a user (admin only)
export const addWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { amount, reason } = req.body;

        // Validate amount
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({ error: 'Amount must be a positive number' });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Add amount to wallet
        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();

        console.log(`[ADMIN] Added ₹${amount} to user ${user.name} (${user.registrationNumber}) wallet. Reason: ${reason || 'Not specified'}`);

        res.json({
            message: 'Wallet balance updated successfully',
            user: {
                id: user._id,
                name: user.name,
                registrationNumber: user.registrationNumber,
                walletBalance: user.walletBalance,
            },
            amountAdded: amount,
            reason: reason || 'Not specified',
        });
    } catch (error: any) {
        console.error('Add wallet balance error:', error);
        res.status(500).json({ error: 'Failed to update wallet balance' });
    }
};

// Reduce wallet balance from a user (admin only)
export const reduceWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { amount, reason } = req.body;

        // Validate amount
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({ error: 'Amount must be a positive number' });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check sufficient balance
        if ((user.walletBalance || 0) < amount) {
            res.status(400).json({
                error: 'Insufficient wallet balance',
                currentBalance: user.walletBalance,
                requestedReduction: amount
            });
            return;
        }

        // Reduce amount from wallet
        user.walletBalance = (user.walletBalance || 0) - amount;
        await user.save();

        console.log(`[ADMIN] Reduced ₹${amount} from user ${user.name} (${user.registrationNumber}) wallet. Reason: ${reason || 'Not specified'}`);

        res.json({
            message: 'Wallet balance reduced successfully',
            user: {
                id: user._id,
                name: user.name,
                registrationNumber: user.registrationNumber,
                walletBalance: user.walletBalance,
            },
            amountReduced: amount,
            reason: reason || 'Not specified',
        });
    } catch (error: any) {
        console.error('Reduce wallet balance error:', error);
        res.status(500).json({ error: 'Failed to reduce wallet balance' });
    }
};

// Reset user password (admin only)
export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters long' });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        console.log(`[ADMIN] Reset password for user ${user.name} (${user.registrationNumber})`);

        res.json({
            message: 'Password reset successfully',
            userId: user._id
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
