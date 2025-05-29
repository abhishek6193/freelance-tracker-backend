import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  // Check if token is blacklisted
  const blacklisted = await BlacklistedToken.findOne({ token });
  if (blacklisted) {
    return res.status(401).json({ message: 'Token is blacklisted.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
