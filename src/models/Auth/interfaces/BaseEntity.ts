/**
 * Base Entity Interface
 * All database entities should extend this interface
 */
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}
