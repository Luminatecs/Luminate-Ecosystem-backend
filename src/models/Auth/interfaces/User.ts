import { BaseEntity } from './BaseEntity';
import { UserRole, EducationLevel } from '../enums';

/**
 * User Interface
 * Core user entity for authentication and profile management
 */
export interface User extends BaseEntity {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  educationLevel?: EducationLevel; // Optional for non-student roles
  organizationId?: string; // Foreign key to Organization, for ORG_WARDs and ORG_ADMINs
  isOrgWard: boolean; // Flag to identify organizational wards
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  organizationSetupComplete?: boolean; // Flag for ORG_ADMIN users to track setup completion
  isSoftDeleted?: boolean;
  softDeletedAt?: Date;
}
