import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    username: string;
    profileImage: string;
  };
}

// Your admin username - replace with your actual Replit username
const ADMIN_USERNAME = 'YOUR_ACTUAL_REPLIT_USERNAME'; // UPDATE THIS WITH YOUR USERNAME

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userHeader = req.headers['x-replit-user-id'];
    const nameHeader = req.headers['x-replit-user-name'];
    const usernameHeader = req.headers['x-replit-user-username'];
    const profileImageHeader = req.headers['x-replit-user-profile-image'];

    if (userHeader && nameHeader && usernameHeader) {
      req.user = {
        id: userHeader as string,
        name: nameHeader as string,
        username: usernameHeader as string,
        profileImage: profileImageHeader as string || ''
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next();
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.username !== process.env.REPL_OWNER && req.user.username !== 'bellejournalapp')) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};