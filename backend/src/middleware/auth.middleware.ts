import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookieToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'غير مصرح - يرجى تسجيل الدخول'
      });
    }

    // Verify token
    const { userId } = authService.verifyToken(token);
    
    // Get user
    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }

    // Attach user to request
    req.userId = userId;
    req.user = user;
    
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'رمز التحقق غير صالح'
    });
  }
};
