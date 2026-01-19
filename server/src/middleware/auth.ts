import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);

        // Verify token
        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded: any = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
