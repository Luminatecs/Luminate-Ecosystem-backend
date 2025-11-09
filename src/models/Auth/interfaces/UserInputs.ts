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
  passwordHash: string;
  role?: UserRole;
  educationLevel?: EducationLevel;
  organizationId?: string;
  isOrgWard?: boolean;
  isActive?: boolean;
  emailVerified?: boolean;
  organizationSetupComplete?: boolean;
  // Guardian fields for ORG_WARD users
  guardianName?: string;
  guardianEmail?: string;
  wardName?: string;
}

/**
 * Update User Input
 * Used for updating existing users
 */
export interface UpdateUserInput {
  name?: string;
  username?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  educationLevel?: EducationLevel;
  isActive?: boolean;
  organizationId?: string;
  isOrgWard?: boolean;
  organizationSetupComplete?: boolean;
}
