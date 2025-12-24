# JWT Refresh Token Rotation Implementation

## Overview
Implemented secure JWT refresh token rotation with 15-minute access tokens and 7-day refresh tokens.

## Changes Made

### 1. Database Schema (`backend/src/db/schema.ts`)
- Added `refreshTokens` table with:
  - `id`: Primary key (UUID)
  - `userId`: Foreign key to users table
  - `token`: Unique refresh token (64-byte hex)
  - `expiresAt`: Token expiration timestamp
  - `createdAt`: Creation timestamp
- Added indexes for performance:
  - `idx_refresh_tokens_user_id`
  - `idx_refresh_tokens_token`
  - `idx_refresh_tokens_expires_at`

### 2. Auth Service (`backend/src/services/auth.service.ts`)
- **Access Token**: Reduced from 7 days to **15 minutes**
- **Refresh Token**: 7 days, stored in database
- New methods:
  - `refreshAccessToken(refreshToken)`: Validates and rotates refresh token
  - `revokeRefreshToken(token)`: Revokes refresh token on logout
  - `generateTokenPair(userId)`: Creates access + refresh token pair
- Token rotation: Old refresh token deleted, new one issued

### 3. Auth Controller (`backend/src/controllers/auth.controller.ts`)
- Updated `signup()` and `login()`:
  - Returns both access and refresh tokens
  - Sets `refreshToken` in httpOnly cookie
- New `refresh()` endpoint:
  - Validates refresh token from cookie
  - Issues new access + refresh token pair
  - Rotates refresh token (one-time use)
- Updated `logout()`:
  - Revokes refresh token from database
  - Clears `refreshToken` cookie

### 4. Auth Middleware (`backend/src/middleware/auth.middleware.ts`)
- Simplified to only accept Bearer token in Authorization header
- Removed cookie-based access token (security improvement)

### 5. Server Routes (`backend/src/server.ts`)
- Added new endpoint: `POST /api/auth/refresh`

### 6. Database Migration
- Generated migration: `drizzle/0001_broad_korath.sql`
- Run with: `pnpm db:push` or `pnpm db:migrate`

## Security Improvements

1. **Short-lived Access Tokens**: 15 minutes reduces exposure window
2. **Token Rotation**: Each refresh invalidates previous token
3. **Database Storage**: Refresh tokens tracked and revocable
4. **httpOnly Cookies**: Refresh tokens not accessible via JavaScript
5. **One-time Use**: Refresh tokens deleted after use
6. **Expiration Tracking**: Database enforces token expiration

## API Usage

### Login/Signup Response
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..." // 15-minute access token
  }
}
```
- Refresh token set in httpOnly cookie

### Refresh Token
```bash
POST /api/auth/refresh
Cookie: refreshToken=<token>

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc..." // New 15-minute access token
  }
}
```
- New refresh token set in httpOnly cookie

### Logout
```bash
POST /api/auth/logout
Cookie: refreshToken=<token>

Response:
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

## Client Implementation

### Frontend Integration
```typescript
// Store access token in memory (not localStorage)
let accessToken = '';

// Interceptor for API calls
async function apiCall(url: string, options: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include', // Send cookies
  });

  // If 401, try refresh
  if (response.status === 401) {
    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshed.ok) {
      const data = await refreshed.json();
      accessToken = data.data.token;
      
      // Retry original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
    }
    
    // Refresh failed, redirect to login
    window.location.href = '/login';
  }

  return response;
}
```

## Migration Steps

1. **Apply Database Migration**:
   ```bash
   cd backend
   pnpm db:push
   ```

2. **Update Frontend**:
   - Remove access token from localStorage
   - Store in memory only
   - Implement refresh logic in API client
   - Add `credentials: 'include'` to all fetch calls

3. **Test Flow**:
   - Login → Verify tokens issued
   - Wait 15 minutes → Access token expires
   - API call → Auto-refresh triggered
   - Logout → Refresh token revoked

## Monitoring

- Track refresh token usage in logs
- Monitor failed refresh attempts (potential attacks)
- Set up alerts for unusual refresh patterns
- Clean up expired tokens periodically:
  ```sql
  DELETE FROM refresh_tokens WHERE expires_at < NOW();
  ```

## Security Considerations

- **XSS Protection**: Access tokens in memory (not localStorage)
- **CSRF Protection**: httpOnly cookies + SameSite=strict
- **Token Theft**: Short-lived access tokens limit damage
- **Replay Attacks**: One-time use refresh tokens
- **Revocation**: Database storage enables instant revocation

## Performance Impact

- Minimal: Refresh happens every 15 minutes per user
- Database query on refresh (indexed, fast)
- Consider cleanup job for expired tokens

## Rollback Plan

If issues arise:
1. Revert code changes
2. Keep `refreshTokens` table (no harm)
3. Increase access token expiry temporarily
4. Investigate and fix issues
5. Re-deploy with fixes
