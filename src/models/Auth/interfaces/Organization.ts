import { BaseEntity } from './BaseEntity';

/**
 * Organization Interface
 * Represents educational institutions or organizations
 */
export interface Organization extends BaseEntity {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  description?: string;
  website?: string;
  adminId: string; // Foreign key to User table, referencing the primary ORG_ADMIN
  isActive: boolean;
  isSoftDeleted?: boolean;
  softDeletedAt?: Date;
}
