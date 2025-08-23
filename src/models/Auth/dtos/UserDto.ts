import { UserRole, EducationLevel, AdminType } from '../enums';

/**
 * Get Current User Profile DTO
 */
export interface GetCurrentUserDto {
  include_organization?: boolean;
  include_profile?: boolean;
  include_admin_details?: boolean;
}

/**
 * Current User Response DTO
 */
export interface GetCurrentUserResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      education_level?: EducationLevel;
      organization_id?: string;
      is_org_ward: boolean;
      is_active: boolean;
      email_verified: boolean;
      last_login_at: Date;
      created_at: Date;
    };
    organization?: {
      id: string;
      name: string;
      contact_email: string;
      contact_phone?: string;
      address?: string;
      description?: string;
      website?: string;
      is_active: boolean;
    };
    profile?: {
      id: string;
      first_name?: string;
      last_name?: string;
      date_of_birth?: Date;
      gender?: string;
      phone_number?: string;
      profile_image_url?: string;
      bio?: string;
      interests?: string[];
      career_goals?: string[];
      current_institution?: string;
      graduation_year?: number;
    };
    admin_details?: {
      id: string;
      admin_type: AdminType;
      permissions?: string[];
      is_active: boolean;
      created_at: Date;
    };
  };
}

/**
 * Update User Profile DTO
 */
export interface UpdateUserProfileDto {
  name?: string;
  education_level?: EducationLevel;
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phone_number?: string;
  bio?: string;
  interests?: string[];
  career_goals?: string[];
  current_institution?: string;
  graduation_year?: number;
}

/**
 * Update User Profile Response DTO
 */
export interface UpdateUserProfileResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      education_level?: EducationLevel;
      updated_at: Date;
    };
    profile: {
      id: string;
      first_name?: string;
      last_name?: string;
      date_of_birth?: Date;
      gender?: string;
      phone_number?: string;
      bio?: string;
      interests?: string[];
      career_goals?: string[];
      current_institution?: string;
      graduation_year?: number;
      updated_at: Date;
    };
  };
}

/**
 * Upload Profile Image DTO
 */
export interface UploadProfileImageDto {
  image: File | Buffer;
  filename: string;
  mimetype: string;
}

/**
 * Upload Profile Image Response DTO
 */
export interface UploadProfileImageResponseDto {
  success: boolean;
  message: string;
  data: {
    profile_image_url: string;
    uploaded_at: Date;
    file_size: number;
    file_type: string;
  };
}

/**
 * Get Organization Ward Users DTO
 * For org admins to view their ward users
 */
export interface GetOrganizationWardsDto {
  page?: number;
  limit?: number;
  education_level?: EducationLevel;
  search?: string; // Search by name or email
  is_active?: boolean;
  email_verified?: boolean;
  order_by?: 'name' | 'email' | 'created_at' | 'last_login_at';
  order_direction?: 'ASC' | 'DESC';
}

/**
 * Organization Ward User Details DTO
 */
export interface OrganizationWardUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  education_level: EducationLevel;
  is_org_ward: boolean;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  
  // Profile information if available
  profile?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    current_institution?: string;
    graduation_year?: number;
  };
  
  // Registration token information
  registration_token?: {
    id: string;
    token: string;
    used_at: Date;
    generated_by: {
      id: string;
      name: string;
      email: string;
    };
  };
}

/**
 * Get Organization Wards Response DTO
 */
export interface GetOrganizationWardsResponseDto {
  success: boolean;
  message: string;
  data: {
    wards: OrganizationWardUserDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      total_wards: number;
      active_wards: number;
      inactive_wards: number;
      verified_wards: number;
      unverified_wards: number;
      by_education_level: Record<EducationLevel, number>;
    };
  };
}

/**
 * Update Organization Ward Status DTO
 */
export interface UpdateWardStatusDto {
  ward_id: string;
  is_active: boolean;
  reason?: string;
}

/**
 * Update Organization Ward Status Response DTO
 */
export interface UpdateWardStatusResponseDto {
  success: boolean;
  message: string;
  data: {
    ward: {
      id: string;
      name: string;
      email: string;
      is_active: boolean;
      updated_at: Date;
    };
    reason?: string;
  };
}

/**
 * Delete User Account DTO
 */
export interface DeleteUserAccountDto {
  current_password: string;
  confirmation: 'DELETE_ACCOUNT';
  reason?: string;
}

/**
 * Delete User Account Response DTO
 */
export interface DeleteUserAccountResponseDto {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    deleted_at: Date;
    reason?: string;
  };
}

/**
 * Get User Activity Log DTO
 */
export interface GetUserActivityDto {
  page?: number;
  limit?: number;
  activity_type?: 'LOGIN' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'EMAIL_VERIFICATION';
  from_date?: Date;
  to_date?: Date;
}

/**
 * User Activity Response DTO
 */
export interface GetUserActivityResponseDto {
  success: boolean;
  message: string;
  data: {
    activities: Array<{
      id: string;
      activity_type: string;
      description: string;
      ip_address?: string;
      user_agent?: string;
      metadata?: any;
      created_at: Date;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}
