/**
 * Application Configuration and Validation
 * Handles environment setup and API initialization
 */

export interface AppConfig {
  apiKey: string;
  isConfigured: boolean;
  environment: 'development' | 'production' | 'preview';
}

/**
 * Get API Key from multiple sources (safe hierarchy)
 */
export const getAPIKey = (): string => {
  // Priority order:
  // 1. Environment variable (GEMINI_API_KEY)
  // 2. Fallback to API_KEY
  // 3. Window global (if available)
  // 4. Empty string
  
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.API_KEY || 
    (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) ||
    '';
  
  return apiKey;
};

/**
 * Validate API Key format
 */
export const isValidAPIKey = (key: string): boolean => {
  if (!key || typeof key !== 'string') return false;
  
  // Gemini API keys typically have a specific format
  // At minimum, they should be non-empty and not placeholder text
  const isPlaceholder = /placeholder|change|your.*key|xxx|demo/i.test(key);
  
  return key.length > 20 && !isPlaceholder;
};

/**
 * Get application configuration
 */
export const getAppConfig = (): AppConfig => {
  const apiKey = getAPIKey();
  const isConfigured = isValidAPIKey(apiKey);
  
  if (!isConfigured) {
    console.warn('⚠️ Warning: GEMINI_API_KEY is not properly configured. AI features will not work.');
    console.warn('Please set GEMINI_API_KEY in your .env.local file.');
  }
  
  return {
    apiKey,
    isConfigured,
    environment: (process.env.NODE_ENV as any) || 'development'
  };
};

/**
 * Format error message for user display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
};

/**
 * Log error with context (for debugging)
 */
export const logError = (context: string, error: unknown): void => {
  const timestamp = new Date().toISOString();
  const message = formatErrorMessage(error);
  
  console.error(`[${timestamp}] [${context}]`, {
    message,
    error,
    stack: error instanceof Error ? error.stack : undefined
  });
};

/**
 * Validate API response structure
 */
export const validateResponse = (response: any, expectedKeys: string[]): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  return expectedKeys.every(key => key in response);
};
