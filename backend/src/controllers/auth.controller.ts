import { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import type { AuthRequest } from '@/middleware/auth.middleware';

const signupSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      const { accessToken, user } = await authService.signup(
        validatedData.email,
        validatedData.password,
        validatedData.firstName,
        validatedData.lastName
      );

      // SECURITY FIX: Generate secure session token instead of using user-controlled data
      const sessionToken = await authService.generateSecureSessionToken(user.id);
      
      // Set httpOnly cookie with server-generated token (not user-controlled)
      res.cookie('token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
      });

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        data: {
          user,
          token: accessToken,
        },
      });

      logger.info('User signed up successfully', { userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Signup error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحساب',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const { accessToken, user } = await authService.login(
        validatedData.email,
        validatedData.password
      );

      // SECURITY FIX: Generate secure session token instead of using user-controlled data
      const sessionToken = await authService.generateSecureSessionToken(user.id);
      
      // Set httpOnly cookie with server-generated token (not user-controlled)
      res.cookie('token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
      });

      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: {
          user,
          token: accessToken,
        },
      });

      logger.info('User logged in successfully', { userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول',
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ',
      });
    }
  }
}

export const authController = new AuthController();
