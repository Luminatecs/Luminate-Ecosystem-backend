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
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  description?: string;
  website?: string;
  adminId?: string;
  adminName: string;
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
}

/**
 * Update Organization Input
 * Used for updating existing organizations
 */
export interface UpdateOrganizationInput {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  description?: string;
  website?: string;
  isActive?: boolean;
  adminId?: string;
}
