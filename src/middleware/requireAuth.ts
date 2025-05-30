import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  BlacklistedToken.findOne({ token })
    .then((blacklisted) => {
      if (blacklisted) {
        res.status(401).json({ message: 'Token is blacklisted.' });
        return;
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
      } catch {
        res.status(401).json({ message: 'Invalid or expired token.' });
      }
    })
    .catch(() => {
      res.status(401).json({ message: 'Invalid or expired token.' });
    });
};
