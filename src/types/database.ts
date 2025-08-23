/**
 * Database Types - Legacy Compatibility and Common Types
 * 
 * This file provides backward compatibility for existing code that imports from types/database
 * All new code should import from models/
 */

// Re-export everything from models for backward compatibility
export * from '../models';

// Common database operation types
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

// Authentication types
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginResponse extends AuthToken {
  user: any; // User object without password
}

export interface RefreshTokenPayload {
  refresh_token: string;
}