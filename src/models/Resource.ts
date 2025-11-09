/**
 * Resource Type Definitions
 * Backend models for resource management
 */

/**
 * Resource Type - Target audience for the resource
 */
export type ResourceType = 'students' | 'parents' | 'counselors';

/**
 * Difficulty Level
 */
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

/**
 * Complete Resource Interface
 */
export interface IResource {
  // Core identifiers
  id: string;
  
  // Basic information (required)
  title: string;
  description: string;
  full_description: string;
  category: string;
  type: string;
  
  // Classification
  resource_type: ResourceType;
  difficulty?: DifficultyLevel;
  
  // Metadata
  rating: number;
  link?: string;
  featured: boolean;
  image?: string;
  duration?: string;
  tags?: string[];
  free: boolean;
  
  // Features (required array)
  features: string[];
  
  // Timestamps & status
  created_at: string;
  updated_at: string;
  is_active: boolean;
  
  // Creator tracking
  created_by?: string;
}

/**
 * Input interface for creating resources
 */
export interface CreateResourceInput {
  // Required fields
  title: string;
  description: string;
  full_description: string;
  category: string;
  type: string;
  resource_type: ResourceType;
  features: string[];
  
  // Optional fields with defaults
  rating?: number;           // default: 0
  link?: string;
  featured?: boolean;        // default: false
  image?: string;
  duration?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
  free?: boolean;            // default: true
  created_by?: string;
}

/**
 * Input interface for updating resources
 */
export interface UpdateResourceInput {
  title?: string;
  description?: string;
  full_description?: string;
  category?: string;
  type?: string;
  resource_type?: ResourceType;
  rating?: number;
  link?: string;
  featured?: boolean;
  image?: string;
  features?: string[];
  duration?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
  free?: boolean;
}
