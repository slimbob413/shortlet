/**
 * Admin Role Middleware
 * 
 * Checks if the authenticated user has admin role.
 * Must be used after authenticateToken middleware.
 */

import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}; 