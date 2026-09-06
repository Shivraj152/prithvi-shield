import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_prithvi_shield_key_123';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    res.status(401).json({ error: 'Access token is missing.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Access token is invalid or expired.' });
      return;
    }
    req.user = user as AuthenticatedRequest['user'];
    next();
  });
}

// Allows restricting endpoints based on role tiers
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. User authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
      return;
    }

    next();
  };
}
