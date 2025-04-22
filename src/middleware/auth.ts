import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../models';
import { ApiError } from './errorHandler';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
    }
  }
}

/**
 * Optional authentication middleware
 * If token is provided and valid, sets req.user and req.userId
 * If no token or invalid token, continues without error
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Token ')) {
      const token = authHeader.substring(6);
      const secret = process.env.JWT_SECRET || 'secret';
      
      try {
        const decoded = jwt.verify(token, secret) as any;
        
        // Find user by ID from token
        const user = await db.User.findByPk(decoded.id);
        
        if (user) {
          // Set user and userId on request object
          req.user = user;
          req.userId = user.id;
        }
      } catch (error) {
        // Invalid token, but we'll continue anyway (optional auth)
        console.error('Invalid token in optional auth:', error);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Required authentication middleware
 * If token is not provided or invalid, returns 401 Unauthorized
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Token ')) {
      throw ApiError.unauthorized('Authorization token is missing');
    }
    
    const token = authHeader.substring(6);
    const secret = process.env.JWT_SECRET || 'secret';
    
    try {
      const decoded = jwt.verify(token, secret) as any;
      
      // Find user by ID from token
      const user = await db.User.findByPk(decoded.id);
      
      if (!user) {
        throw ApiError.unauthorized('User not found');
      }
      
      // Set user and userId on request object
      req.user = user;
      req.userId = user.id;
      
      next();
    } catch (error) {
      if (error instanceof Error && 
          (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
        throw ApiError.unauthorized('Invalid or expired token');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
