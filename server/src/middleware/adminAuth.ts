import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check if user exists and is an admin
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!req.user.isAdmin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(403).json({ error: 'Admin authorization failed' });
    }
};
