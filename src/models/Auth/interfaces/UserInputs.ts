import { UserRole, EducationLevel } from '../enums';

/**
 * Input Interfaces for Database Operations
 */

/**
 * Create User Input
 * Used for creating new users in the database
 */
export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  password_hash: string;
  role?: UserRole;
  education_level?: EducationLevel;
  organization_id?: string;
  is_org_ward?: boolean;
  is_active?: boolean;
  email_verified?: boolean;
}

/**
 * Update User Input
 * Used for updating existing users
 */
export interface UpdateUserInput {
  name?: string;
  username?: string;
  email?: string;
  password_hash?: string;
  role?: UserRole;
  education_level?: EducationLevel;
  is_active?: boolean;
  organization_id?: string;
  is_org_ward?: boolean;
}
