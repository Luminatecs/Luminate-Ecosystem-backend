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
  password_hash: string;
  role: UserRole;
  education_level?: EducationLevel; // Optional for non-student roles
  organization_id?: string; // Foreign key to Organization, for ORG_WARDs and ORG_ADMINs
  is_org_ward: boolean; // Flag to identify organizational wards
  is_active: boolean;
  last_login_at?: Date;
  email_verified: boolean;
  email_verified_at?: Date;
  is_soft_deleted?: boolean;
  soft_deleted_at?: Date;
}
