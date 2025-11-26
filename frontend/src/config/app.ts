/**
 * Application-wide configuration and constants
 */

export const APP_NAME = "النسخة" as const;
export const APP_NAME_EN = "The Copy" as const;

export const ROUTES = {
  HOME: "/",
  EDITOR: "/editor",
  ANALYSIS: "/analysis",
  DEVELOPMENT: "/development",
  BRAINSTORM: "/brainstorm",
  DIRECTORS_STUDIO: "/directors-studio",
  CINEMATOGRAPHY: "/cinematography-studio",
  ARABIC_WRITING: "/arabic-creative-writing-studio",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;
