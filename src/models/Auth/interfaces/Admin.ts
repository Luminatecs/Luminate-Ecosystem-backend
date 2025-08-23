import { BaseEntity } from './BaseEntity';
import { AdminType } from '../enums';

/**
 * Admin Interface
 * Represents administrative users with special permissions
 */
export interface Admin extends BaseEntity {
  user_id: string; // Foreign key to User table
  admin_type: AdminType;
  organization_id?: string; // Optional, for ORG_ADMINs
  permissions?: string[]; // Array of permission strings
  is_active: boolean;
  is_soft_deleted?: boolean;
  soft_deleted_at?: Date;
}
