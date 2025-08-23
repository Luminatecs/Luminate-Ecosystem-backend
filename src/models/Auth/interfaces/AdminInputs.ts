import { AdminType } from '../enums';

/**
 * Admin Input Interfaces
 * Used for creating and updating admin records
 */

/**
 * Create Admin Input
 * Used for creating new admin records
 */
export interface CreateAdminInput {
  user_id: string;
  admin_type: AdminType;
  organization_id?: string;
  permissions?: string[];
}

/**
 * Update Admin Input
 * Used for updating existing admin records
 */
export interface UpdateAdminInput {
  admin_type?: AdminType;
  organization_id?: string;
  permissions?: string[];
  is_active?: boolean;
}
