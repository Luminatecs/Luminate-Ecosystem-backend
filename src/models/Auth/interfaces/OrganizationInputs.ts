/**
 * Organization Input Interfaces
 * Used for creating and updating organizations
 */

/**
 * Create Organization Input
 * Used for creating new organizations with admin user
 */
export interface CreateOrganizationInput {
  name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  admin_id?: string;
  admin_name: string;
  admin_username: string;
  admin_email: string;
  admin_password: string;
}

/**
 * Update Organization Input
 * Used for updating existing organizations
 */
export interface UpdateOrganizationInput {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  is_active?: boolean;
}
