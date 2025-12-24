import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'غير مصرح - يرجى تسجيل الدخول' });
    }

    const { userId } = authService.verifyToken(token);
    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });
    }

    req.userId = userId;
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'رمز التحقق غير صالح' });
  }
};
