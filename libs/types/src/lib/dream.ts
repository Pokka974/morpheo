/**
 * Unified Dream interface that works for both frontend and backend
 * This resolves the naming differences between Prisma model and frontend types
 */
export interface Dream {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: Date | string; // Prisma returns Date, API serializes to string
  updatedAt: Date | string;
  advice: string;
  culturalReferences: Record<string, string>; // Unified from JSON type
  dallEPrompt: string; // Backend naming (camelCase)
  emotions: string[];
  keywords: string[];
  midjourneyPrompt: string; // Backend naming (camelCase)
  dalleImagePath?: string; // Optional field - temporary URL from OpenAI
  dalleImageData?: string; // Optional field - permanent base64 image data
  summary: string;
  emoji: string;
  recurringDreamAnalysis?: RecurringDreamAnalysis; // Optional field for recurring patterns
}

/**
 * API-friendly version with string dates (for JSON serialization)
 */
export interface DreamAPI extends Omit<Dream, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

/**
 * Recurring dream analysis structure
 */
export interface RecurringDreamAnalysis {
  hasConnections: boolean;
  connectedDreams: Array<{
    id: string;
    title: string;
    date: string;
    connection: string;
  }>;
  patterns: string[];
  interpretation: string;
}

/**
 * Raw dream analysis response from AI (matches Zod schema structure)
 */
export interface DreamAnalysisResponse {
  title: string;
  summary: string;
  emotions: string[]; // Should be length 3
  keywords: string[]; // Should be min 4
  cultural_references: Record<string, string>; // AI returns snake_case
  advice: string;
  emoji: string;
  'dall-e-prompt': string; // AI returns kebab-case
  'midjourney-prompt': string; // AI returns kebab-case
  recurring_dream_analysis?: RecurringDreamAnalysis; // Optional field for recurring patterns
}

/**
 * Dream creation request (what frontend sends)
 */
export interface CreateDreamRequest {
  description: string;
  userId: string;
}

/**
 * Dream update request
 */
export interface UpdateDreamRequest {
  title?: string;
  description?: string;
  advice?: string;
  culturalReferences?: Record<string, string>;
  dallEPrompt?: string;
  emotions?: string[];
  keywords?: string[];
  midjourneyPrompt?: string;
  dalleImagePath?: string;
  dalleImageData?: string;
  summary?: string;
  emoji?: string;
}

/**
 * Dream list response with pagination
 */
export interface DreamListResponse {
  dreams: DreamAPI[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}