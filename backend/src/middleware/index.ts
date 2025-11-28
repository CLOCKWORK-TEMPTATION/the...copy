import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import {
  logSecurityEvent,
  SecurityEventType,
} from "./security-logger.middleware";

export const setupMiddleware = (app: express.Application): void => {
  // Enhanced Security middleware with strict CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: "same-site" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: "deny" },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true,
    })
  );

  // CORS configuration
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) =>
    origin.trim()
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );

  // Compression
  app.use(compression() as any);

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Rate limiting - General API rate limit
  const generalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
    max: env.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window by default
    message: {
      success: false,
      error: "تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict rate limiting for authentication endpoints (prevent brute force)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: false, // Count all requests
    message: {
      success: false,
      error: "تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Moderate rate limiting for AI-intensive endpoints
  const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 AI requests per hour
    message: {
      success: false,
      error:
        "تم تجاوز الحد المسموح من طلبات التحليل بالذكاء الاصطناعي، يرجى المحاولة لاحقاً",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply general rate limiting to all API routes
  app.use("/api/", generalLimiter as any);

  // Apply stricter rate limiting to auth endpoints
  app.use("/api/auth/login", authLimiter as any);
  app.use("/api/auth/signup", authLimiter as any);

  // Apply AI-specific rate limiting to analysis endpoints
  app.use("/api/analysis/", aiLimiter as any);
  app.use("/api/projects/:id/analyze", aiLimiter as any);

  // Request logging
  app.use((req, res, next) => {
    logger.info("Request received", {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    next();
  });
};

// Export validation utilities
export {
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas,
  detectAttacks,
} from "./validation.middleware";

// Error handling middleware - must be registered separately in server.ts after all routes
export const errorHandler = (
  error: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  logger.error("Unhandled error:", error);

  res.status(500).json({
    success: false,
    error: "حدث خطأ داخلي في الخادم",
  });
};
