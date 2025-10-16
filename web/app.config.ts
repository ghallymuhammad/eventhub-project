/**
 * App Configuration for EventHub Web Application
 * This file contains all the configuration settings for the Next.js frontend
 */

// API Configuration
const BASE_API_URL = 
  process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8000/api";

// App Information
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "EventHub";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
const APP_DESCRIPTION = 
  process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Event Management Platform";

// Environment
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";
const IS_DEVELOPMENT = NODE_ENV === "development";

// URLs and Domains
const FRONTEND_URL = 
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Authentication Configuration
const JWT_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

// Session Configuration
const SESSION_TIMEOUT = 
  parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || "3600000"); // 1 hour in ms

// File Upload Configuration
const MAX_FILE_SIZE = 
  parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "5242880"); // 5MB in bytes
const ALLOWED_FILE_TYPES = [
  "image/jpeg", 
  "image/jpg", 
  "image/png", 
  "image/webp",
  "application/pdf"
];

// Pagination
const DEFAULT_PAGE_SIZE = 
  parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || "10");
const MAX_PAGE_SIZE = 
  parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || "100");

// Toast/Notification Configuration
const TOAST_DURATION = 4000; // 4 seconds
const TOAST_POSITION = "top-right";

// API Timeouts
const API_TIMEOUT = 
  parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"); // 30 seconds

// Feature Flags
const FEATURES = {
  REGISTRATION_ENABLED: 
    process.env.NEXT_PUBLIC_REGISTRATION_ENABLED !== "false",
  EMAIL_VERIFICATION: 
    process.env.NEXT_PUBLIC_EMAIL_VERIFICATION === "true",
  SOCIAL_LOGIN: 
    process.env.NEXT_PUBLIC_SOCIAL_LOGIN === "true",
  DARK_MODE: 
    process.env.NEXT_PUBLIC_DARK_MODE !== "false",
};

// External Services (if needed)
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

// Theme Configuration
const THEME = {
  PRIMARY_COLOR: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#3b82f6",
  SECONDARY_COLOR: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#64748b",
  SUCCESS_COLOR: process.env.NEXT_PUBLIC_SUCCESS_COLOR || "#10b981",
  ERROR_COLOR: process.env.NEXT_PUBLIC_ERROR_COLOR || "#ef4444",
  WARNING_COLOR: process.env.NEXT_PUBLIC_WARNING_COLOR || "#f59e0b",
};

// Export all configuration
export {
  // API
  BASE_API_URL,
  
  // App Info
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  
  // Environment
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  
  // URLs
  FRONTEND_URL,
  BACKEND_URL,
  
  // Authentication
  JWT_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY,
  SESSION_TIMEOUT,
  
  // File Upload
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  
  // Pagination
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  
  // UI
  TOAST_DURATION,
  TOAST_POSITION,
  
  // API
  API_TIMEOUT,
  
  // Features
  FEATURES,
  
  // External Services
  GOOGLE_MAPS_API_KEY,
  STRIPE_PUBLIC_KEY,
  ANALYTICS_ID,
  
  // Theme
  THEME,
};

// Default export for convenience
export default {
  BASE_API_URL,
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  FRONTEND_URL,
  BACKEND_URL,
  JWT_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY,
  SESSION_TIMEOUT,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TOAST_DURATION,
  TOAST_POSITION,
  API_TIMEOUT,
  FEATURES,
  GOOGLE_MAPS_API_KEY,
  STRIPE_PUBLIC_KEY,
  ANALYTICS_ID,
  THEME,
};