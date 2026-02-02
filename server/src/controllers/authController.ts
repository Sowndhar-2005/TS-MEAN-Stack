import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' } as jwt.SignOptions);
};

// Login (Strict - No Auto-Register)
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, registrationNumber } = req.body;

        if (!email || !registrationNumber) {
            res.status(400).json({ error: 'Please provide Email and Registration Number' });
            return;
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanRegNo = registrationNumber.toUpperCase().trim();

        // 1. Check if user exists
        const user = await User.findOne({ email: cleanEmail }).select('+password');

        if (!user) {
            // Strict Mode: User must exist
            res.status(401).json({ error: 'User not found. Please contact admin to register.' });
            return;
        }

        // 2. Validate Registration Number
        if (user.registrationNumber !== cleanRegNo) {
            res.status(401).json({ error: 'Invalid Registration Number for this Email' });
            return;
        }

        // Generate token (30 days)
        const token = generateToken(user._id.toString());

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                registrationNumber: user.registrationNumber,
                userType: user.userType,
                isAdmin: user.isAdmin,
                walletBalance: user.walletBalance,
                collegePoints: user.collegePoints,
                department: user.department,
                year: user.year,
            },
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
};

// Admin Login (Password-based)
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            res.status(400).json({ error: 'Please provide Email and Password' });
            return;
        }

        const cleanIdentifier = identifier.toLowerCase().trim();

        // Find admin user by email
        const user = await User.findOne({
            email: cleanIdentifier,
            isAdmin: true
        }).select('+password');

        if (!user) {
            res.status(401).json({ error: 'Invalid admin credentials' });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid admin credentials' });
            return;
        }

        // Generate token (30 days)
        const token = generateToken(user._id.toString());

        res.json({
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                registrationNumber: user.registrationNumber,
                userType: user.userType,
                isAdmin: user.isAdmin,
                walletBalance: user.walletBalance,
                collegePoints: user.collegePoints,
                department: user.department,
                year: user.year,
            },
        });

    } catch (error: any) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Admin login failed', details: error.message });
    }
};

// Get current user profile
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);

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
            isAdmin: user.isAdmin,
            walletBalance: user.walletBalance,
            collegePoints: user.collegePoints,
            department: user.department,
            year: user.year,
            totalSpent: user.totalSpent,
            totalOrders: user.totalOrders,
            savedCombos: user.savedCombos,
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, department, year } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, department, year },
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                year: user.year,
            },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
