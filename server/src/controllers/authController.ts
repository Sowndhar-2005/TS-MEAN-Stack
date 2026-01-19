import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const DEFAULT_WALLET_BALANCE = Number(process.env.DEFAULT_WALLET_BALANCE) || 3000;
const COLLEGE_EMAIL_DOMAIN = process.env.COLLEGE_EMAIL_DOMAIN || '@college.edu';

// Helper function to detect user type
const detectUserType = (email: string, registrationNumber: string): 'dayscholar' | 'hosteller' => {
    // Logic: If registration number starts with specific patterns or email domain
    // For now, simple logic: Hostellers have 'H' in registration number
    if (registrationNumber.includes('H') || email.includes('hostel')) {
        return 'hosteller';
    }
    return 'dayscholar';
};

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, registrationNumber, password, department, year } = req.body;

        // Validate college email
        if (!email.endsWith(COLLEGE_EMAIL_DOMAIN)) {
            res.status(400).json({
                error: `Invalid college email. Must end with ${COLLEGE_EMAIL_DOMAIN}`,
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { registrationNumber }],
        });

        if (existingUser) {
            res.status(400).json({
                error: 'User with this email or registration number already exists',
            });
            return;
        }

        // Detect user type
        const userType = detectUserType(email, registrationNumber);

        // Create new user
        const user = new User({
            name,
            email,
            registrationNumber,
            password,
            userType,
            department,
            year,
            walletBalance: DEFAULT_WALLET_BALANCE,
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                registrationNumber: user.registrationNumber,
                userType: user.userType,
                walletBalance: user.walletBalance,
                department: user.department,
                year: user.year,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate token
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
                walletBalance: user.walletBalance,
                collegePoints: user.collegePoints,
                department: user.department,
                year: user.year,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
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
