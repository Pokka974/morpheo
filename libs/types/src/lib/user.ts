/**
 * User-related types and interfaces
 */

/**
 * Basic user information from Clerk
 */
export interface User {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Extended user data stored in our system
 */
export interface UserProfile {
  userId: string;
  dreamPreferences?: string[];
  notificationSettings?: {
    dreamReminders: boolean;
    analysisComplete: boolean;
    weeklyDigest: boolean;
  };
  preferences?: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

/**
 * User session data
 */
export interface UserSession {
  user: User;
  profile?: UserProfile;
  isAuthenticated: boolean;
  token?: string;
}

/**
 * User registration data
 */
export interface UserRegistration {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * User login data
 */
export interface UserLogin {
  email: string;
  password: string;
}