import { BaseEntity } from './BaseEntity';
import { Gender } from '../enums';

/**
 * User Profile Interface
 * Extended user information for profile management
 */
export interface UserProfile extends BaseEntity {
  user_id: string; // Foreign key to User table
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  gender?: Gender;
  phone_number?: string;
  profile_image_url?: string;
  bio?: string;
  interests?: string[]; // Array of interest tags
  career_goals?: string[];
  current_institution?: string;
  graduation_year?: number;
  is_soft_deleted?: boolean;
  soft_deleted_at?: Date;
}
