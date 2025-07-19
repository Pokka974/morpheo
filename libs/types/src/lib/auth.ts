/**
 * Authentication-related types and interfaces
 */

/**
 * Authentication modes for the mobile app
 */
export type AuthMode = 'login' | 'register';

/**
 * Auth form data
 */
export interface AuthFormData {
  username?: string | null;
  email: string;
  password: string;
  repeatPassword?: string | null;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'apple' | 'facebook' | 'github';

/**
 * Authentication status
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: any; // Clerk user type
  error?: string;
}

/**
 * JWT token payload
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  iat: number; // Issued at
  exp: number; // Expires at
  iss: string; // Issuer
}

/**
 * Token refresh request
 */
export interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}