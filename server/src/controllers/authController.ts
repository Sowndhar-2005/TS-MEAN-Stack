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
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

const ALLOWED_DOMAINS = [COLLEGE_EMAIL_DOMAIN, '@gmail.com'];

// Helper to validate email domain
const isValidEmailDomain = (email: string): boolean => {
    return ALLOWED_DOMAINS.some(domain => email.endsWith(domain));
};

// ... (keep detectUserType and generateToken as is)

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, registrationNumber, password, department, year, userType } = req.body;

        // 1. Basic Validation
        if (!name || !email || !registrationNumber || !password) {
            res.status(400).json({ error: 'All fields (Name, Email, RegNo, Password) are required' });
            return;
        }

        // 2. Validate email domain (College OR Gmail)
        if (!isValidEmailDomain(email)) {
            res.status(400).json({
                error: `Invalid email. Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`,
            });
            return;
        }

        // ... (rest of registration logic including lowercase/uppercase normalization)

        // 3. Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { registrationNumber: registrationNumber.toUpperCase() }],
        });

        if (existingUser) {
            res.status(400).json({
                error: 'User with this email or registration number already exists',
            });
            return;
        }

        // Determine user type: preferred from body, fallback to detection
        let finalUserType = userType;
        if (!finalUserType || (finalUserType !== 'dayscholar' && finalUserType !== 'hosteller')) {
            finalUserType = detectUserType(email, registrationNumber);
        }

        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            registrationNumber: registrationNumber.toUpperCase(),
            password,
            userType: finalUserType,
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
                isAdmin: user.isAdmin,
                walletBalance: user.walletBalance,
                department: user.department,
                year: user.year,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message || error });
    }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Login Request Body:', req.body); // DEBUG

        // Accept identifier (which can be email or regNo) and password
        const { identifier, password } = req.body;

        if (!identifier && !req.body.email && !req.body.registrationNumber) {
            res.status(400).json({ error: 'Please provide Email or Registration Number' });
            return;
        }

        if (!password) {
            res.status(400).json({ error: 'Please provide Password' });
            return;
        }

        // Determine effective identifier and type
        const rawIdentifier = identifier || req.body.email || req.body.registrationNumber;
        const cleanIdentifier = rawIdentifier.toString().trim();
        const isEmail = cleanIdentifier.includes('@');

        console.log('Login Attempt:', { cleanIdentifier, isEmail });

        let user;

        if (isEmail) {
            // Email Login
            user = await User.findOne({ email: cleanIdentifier.toLowerCase() }).select('+password');
        } else {
            // RegNo Login (force uppercase)
            user = await User.findOne({ registrationNumber: cleanIdentifier.toUpperCase() }).select('+password');
        }

        console.log('User Found:', user ? 'YES' : 'NO');

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials (User not found)' });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        console.log('Password Valid:', isPasswordValid);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials (Password mismatch)' });
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
                isAdmin: user.isAdmin,
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
