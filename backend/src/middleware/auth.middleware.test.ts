import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authMiddleware, type AuthRequest } from './auth.middleware';
import { Response, NextFunction } from 'express';

// Mock auth service
vi.mock('../services/auth.service', () => ({
  authService: {
    verifyToken: vi.fn(),
    getUserById: vi.fn(),
  },
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let authService: any;

  beforeEach(async () => {
    mockRequest = {
      headers: {},
      cookies: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();

    const authServiceModule = await import('../services/auth.service');
    authService = authServiceModule.authService;

    vi.clearAllMocks();
  });

  describe('Token from Authorization header', () => {
    it('should successfully authenticate with valid Bearer token', async () => {
      const userId = 'user-123';
      const token = 'valid-jwt-token';
      const user = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      vi.mocked(authService.verifyToken).mockReturnValue({ userId });
      vi.mocked(authService.getUserById).mockResolvedValue(user);

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(authService.verifyToken).toHaveBeenCalledWith(token);
      expect(authService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockRequest.userId).toBe(userId);
      expect(mockRequest.user).toEqual(user);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header is missing Bearer prefix', async () => {
      mockRequest.headers = {
        authorization: 'InvalidPrefix token',
      };
      mockRequest.cookies = {};

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'غير مصرح - يرجى تسجيل الدخول',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Token from Cookie', () => {
    it('should successfully authenticate with valid cookie token', async () => {
      const userId = 'user-123';
      const token = 'valid-jwt-token';
      const user = {
        id: userId,
        email: 'test@example.com',
      };

      mockRequest.cookies = { token };

      vi.mocked(authService.verifyToken).mockReturnValue({ userId });
      vi.mocked(authService.getUserById).mockResolvedValue(user);

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(authService.verifyToken).toHaveBeenCalledWith(token);
      expect(authService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockRequest.userId).toBe(userId);
      expect(mockRequest.user).toEqual(user);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should prioritize Authorization header over cookie', async () => {
      const userId = 'user-123';
      const headerToken = 'header-token';
      const cookieToken = 'cookie-token';
      const user = { id: userId, email: 'test@example.com' };

      mockRequest.headers = {
        authorization: `Bearer ${headerToken}`,
      };
      mockRequest.cookies = { token: cookieToken };

      vi.mocked(authService.verifyToken).mockReturnValue({ userId });
      vi.mocked(authService.getUserById).mockResolvedValue(user);

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(authService.verifyToken).toHaveBeenCalledWith(headerToken);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error cases', () => {
    it('should return 401 if no token provided', async () => {
      mockRequest.headers = {};
      mockRequest.cookies = {};

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'غير مصرح - يرجى تسجيل الدخول',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      const token = 'invalid-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      vi.mocked(authService.verifyToken).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'رمز التحقق غير صالح',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      const userId = 'nonexistent-user';
      const token = 'valid-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      vi.mocked(authService.verifyToken).mockReturnValue({ userId });
      vi.mocked(authService.getUserById).mockResolvedValue(null);

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'المستخدم غير موجود',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';
      const token = 'valid-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      vi.mocked(authService.verifyToken).mockReturnValue({ userId });
      vi.mocked(authService.getUserById).mockRejectedValue(
        new Error('Database connection error')
      );

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'رمز التحقق غير صالح',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined cookies object', async () => {
      mockRequest.headers = {};
      delete mockRequest.cookies;

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty string token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
