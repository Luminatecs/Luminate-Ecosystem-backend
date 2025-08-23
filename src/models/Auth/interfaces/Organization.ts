import { BaseEntity } from './BaseEntity';

/**
 * Organization Interface
 * Represents educational institutions or organizations
 */
export interface Organization extends BaseEntity {
  name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  admin_id: string; // Foreign key to User table, referencing the primary ORG_ADMIN
  is_active: boolean;
  is_soft_deleted?: boolean;
  soft_deleted_at?: Date;
}
