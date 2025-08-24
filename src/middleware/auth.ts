import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService';
import { UserRole } from '../models/Auth/enums';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        organization_id?: string;
        name?: string;
      };
    }
  }
}

export class AuthMiddleware {
  private userService: UserService;
  private jwtSecret: string;

  constructor() {
    this.userService = new UserService();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  /**
   * Middleware to authenticate JWT token
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: 'No authorization header provided'
        });
        return;
      }

      const token = authHeader.split(' ')[1]; // Bearer <token>
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'No token provided'
        });
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Check if user still exists and is active
      const user = await this.userService.getUserById(decoded.userId);
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
        return;
      }

      // Add user info to request
      const userInfo: any = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      if (user.organizationId) {
        userInfo.organizationId = user.organizationId;
      }

      if (user.name) {
        userInfo.name = user.name;
      }

      req.user = userInfo;

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  };

  /**
   * Middleware to check if user has required role(s)
   */
  authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware to check if user is admin or super admin
   */
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    this.authorize(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)(req, res, next);
  };

  /**
   * Middleware to check if user is super admin
   */
  requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
    this.authorize(UserRole.SUPER_ADMIN)(req, res, next);
  };

  /**
   * Middleware to check if user owns the resource or is admin
   */
  requireOwnershipOrAdmin = (userIdField: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const resourceUserId = req.params[userIdField] || req.body[userIdField];
      const isOwner = req.user.userId === resourceUserId;
      const isAdmin = [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You can only access your own resources'
        });
        return;
      }

      next();
    };
  };

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return next();
      }

      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Check if user still exists and is active
      const user = await this.userService.getUserById(decoded.userId);
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      }

      next();
    } catch (error) {
      // If token is invalid, just continue without user
      next();
    }
  };
}

// Create and export middleware instance
const authMiddleware = new AuthMiddleware();
export const { 
  authenticate, 
  authorize, 
  requireAdmin, 
  requireSuperAdmin, 
  requireOwnershipOrAdmin,
  optionalAuth 
} = authMiddleware;
