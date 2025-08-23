// Base interface for all database entities
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// Education Level Enum
export enum EducationLevel {
  JHS1 = 'JHS1',
  JHS2 = 'JHS2', 
  JHS3 = 'JHS3',
  SHS1 = 'SHS1',
  SHS2 = 'SHS2',
  SHS3 = 'SHS3',
  UNIVERSITY = 'UNIVERSITY'
}

// User Role Enum - Updated for career guidance system
export enum UserRole {
  INDIVIDUAL = 'INDIVIDUAL',
  ORG_WARD = 'ORG_WARD',
  ORG_ADMIN = 'ORG_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Admin Type Enum
export enum AdminType {
  ORG_ADMIN = 'ORG_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Registration Token Status Enum
export enum TokenStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

// User Interface - Updated for career guidance system
export interface User extends BaseEntity {
  name: string;
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
}

// Organization Interface - Updated
export interface Organization extends BaseEntity {
  name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  admin_id: string; // Foreign key to User table, referencing the primary ORG_ADMIN
  is_active: boolean;
}

// Admin Interface - New
export interface Admin extends BaseEntity {
  user_id: string; // Foreign key to User table
  admin_type: AdminType;
  organization_id?: string; // Optional, for ORG_ADMINs
  permissions?: string[]; // Array of permission strings
  is_active: boolean;
}

// Registration Token Interface - New
export interface RegistrationToken extends BaseEntity {
  token: string; // The unique token string
  generated_by_user_id: string; // Foreign key to User table (ORG_ADMIN who generated token)
  organization_id: string; // Foreign key to Organization table
  status: TokenStatus;
  used_by_user_id?: string; // Foreign key to User table (ORG_WARD who used token)
  student_name?: string; // Intended student name
  student_email?: string; // Intended student email
  education_level?: EducationLevel; // Intended education level
  max_uses: number; // Maximum number of times token can be used
  current_uses: number; // Current number of uses
  expires_at: Date;
  used_at?: Date;
}

// User Profile Interface - New
export interface UserProfile extends BaseEntity {
  user_id: string; // Foreign key to User table
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phone_number?: string;
  profile_image_url?: string;
  bio?: string;
  interests?: string[]; // Array of interest tags
  career_goals?: string[];
  current_institution?: string;
  graduation_year?: number;
}

// Input Interfaces
export interface CreateUserInput {
  name: string;
  username?: string;
  email: string;
  password_hash: string;
  role?: UserRole;
  education_level?: EducationLevel;
  organization_id?: string;
  is_org_ward?: boolean;
  is_active?: boolean;
  email_verified?: boolean;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  education_level: EducationLevel;
  role?: UserRole;
}

export interface RegisterOrganizationInput {
  // Organization details
  organization_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  
  // Admin user details
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface RegisterOrgWardInput {
  token: string;
  name: string;
  email: string;
  password: string;
  education_level: EducationLevel;
}

export interface CreateRegistrationTokenInput {
  student_name?: string;
  student_email?: string;
  education_level?: EducationLevel;
  max_uses?: number;
  expires_in_days?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password_hash?: string;
  role?: UserRole;
  education_level?: EducationLevel;
  is_active?: boolean;
  organization_id?: string;
  is_org_ward?: boolean;
}

export interface CreateOrganizationInput {
  name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  admin_id?: string;
  admin_name?: string;
  admin_username?: string;
  admin_email?: string;
  admin_password?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  is_active?: boolean;
}

// Authentication Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: Omit<User, 'password_hash'>;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

// Query options for pagination and filtering
export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
