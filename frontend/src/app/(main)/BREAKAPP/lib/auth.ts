import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Store JWT token in localStorage
 */
export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expirationTime;
  } catch (error) {
    return false;
  }
}

/**
 * Get current user data from token
 */
export function getCurrentUser(): { userId: string; projectId: string; role: string } | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.sub,
      projectId: payload.projectId,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Scan QR code and authenticate
 */
export async function scanQRAndLogin(qrToken: string, deviceHash: string): Promise<{ access_token: string; user: any }> {
  const response = await api.post('/auth/scan-qr', {
    qr_token: qrToken,
    device_hash: deviceHash,
  });
  return response.data;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<{ valid: boolean; payload: any }> {
  const response = await api.post('/auth/verify', { token });
  return response.data;
}

/**
 * Generate device hash (fingerprint)
 * Note: This is a client-side only function
 */
export function generateDeviceHash(): string {
  if (typeof window === 'undefined') {
    throw new Error('Device fingerprinting is only available on the client side');
  }

  // Simple device fingerprint based on navigator properties
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ];

  const fingerprint = components.join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

export { api };
