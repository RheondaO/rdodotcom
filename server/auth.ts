import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    username: string;
    profileImage: string;
  };
}

// Simple admin credentials - in production, use proper authentication
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fallback-password';

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated via session
    if ((req as any).session?.isAuthenticated) {
      req.user = {
        id: 'admin',
        name: 'Admin User',
        username: 'admin',
        profileImage: ''
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next();
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !(req as any).session?.isAuthenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !(req as any).session?.isAuthenticated || !(req as any).session?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Login endpoint
export const adminLogin = (req: AuthenticatedRequest, res: Response) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    (req as any).session.isAuthenticated = true;
    (req as any).session.isAdmin = true;
    (req as any).session.username = username;
    
    res.json({ 
      success: true, 
      message: 'Admin login successful',
      user: {
        id: 'admin',
        name: 'Admin User',
        username: 'admin',
        profileImage: ''
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Logout endpoint
export const adminLogout = (req: AuthenticatedRequest, res: Response) => {
  (req as any).session.destroy((err: any) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
    } else {
      res.json({ success: true, message: 'Logged out successfully' });
    }
  });
};