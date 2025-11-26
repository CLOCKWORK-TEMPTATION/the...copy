# Middleware Module Documentation

## Overview
The Middleware module contains all middleware functions used in the application. Middleware functions are executed in sequence for every request and can perform various tasks such as authentication, logging, request body parsing, error handling, and more, before the request reaches the route handler.

## Files and Their Functions

### auth.middleware.ts
- **Purpose**: Contains middleware functions specifically designed for authentication and authorization
- **Key Functions**:
  - `authMiddleware`: Verifies JWT tokens, checks user permissions, and ensures only authorized users can access protected routes
- **Dependencies**:
  - `express` for request/response handling
  - `authService` for authentication operations
- **Key Features**:
  - Token extraction from Authorization header or cookies
  - Token verification
  - User retrieval and attachment to request
  - Error handling for various authentication scenarios
- **Security Considerations**:
  - Proper token handling and verification
  - Secure user information attachment
  - Comprehensive error handling

### auth.middleware.test.ts
- **Purpose**: Contains unit and integration tests for auth.middleware.ts
- **Key Test Cases**:
  - Authentication with valid Bearer token
  - Authentication with valid cookie token
  - Error handling for missing tokens
  - Error handling for invalid tokens
  - Error handling for non-existent users
  - Edge cases and error conditions
- **Testing Framework**: Vitest
- **Test Coverage**:
  - Happy path scenarios
  - Edge cases and error conditions
  - Mocking of external dependencies

### index.ts
- **Purpose**: Aggregates and exports all middleware functions from this directory
- **Key Middleware**:
  - Security middleware (Helmet)
  - CORS configuration
  - Compression middleware
  - Body parsing middleware
  - Rate limiting middleware
  - Request logging middleware
  - Error handling middleware
- **Dependencies**:
  - `express` for middleware functions
  - `cors` for CORS configuration
  - `helmet` for security headers
  - `compression` for response compression
  - `express-rate-limit` for rate limiting
  - `env` configuration for environment variables
  - `logger` utility for logging
- **Key Features**:
  - Comprehensive security configuration
  - CORS configuration with proper origin settings
  - Response compression for performance
  - Body parsing with size limits
  - Rate limiting to prevent abuse
  - Request logging for monitoring
  - Centralized error handling
- **Security Considerations**:
  - Proper security headers
  - Secure CORS configuration
  - Rate limiting to prevent abuse
  - Comprehensive error handling

### index.test.ts
- **Purpose**: Contains tests for the general-purpose middleware defined in index.ts
- **Key Test Cases**:
  - Security headers verification
  - CORS configuration verification
  - Response compression verification
  - Body parsing verification
  - Rate limiting verification
  - Request logging verification
  - Error handling verification
- **Testing Framework**: Vitest
- **Test Coverage**:
  - Happy path scenarios
  - Edge cases and error conditions
  - Mocking of external dependencies

## Notes
- Middleware is crucial for implementing cross-cutting concerns (e.g., security, logging) in a modular and reusable way
- The order of middleware execution is significant, especially for authentication and error handling
- Centralized error handling middleware is typically defined here or in a similar top-level module
- The middleware setup provides a solid foundation for security, performance, and monitoring
- The module follows security best practices for web applications

## Relationships with Other Modules
- The authentication middleware interacts with the authService for token verification and user retrieval
- The general middleware setup is used by the application to configure the Express server
- The middleware functions are used by the application to handle requests and responses
- The error handling middleware is used to catch and handle errors throughout the application
- The middleware module provides the foundation for request processing in the application