import { EducationLevel, TokenStatus, AdminType } from '../enums';

/**
 * Create Registration Token DTO
 * For org admins creating tokens for students
 */
export interface CreateRegistrationTokenDto {
  student_name?: string;
  student_email?: string;
  education_level?: EducationLevel;
  max_uses?: number; // Defaults to 1
  expires_in_days?: number; // Defaults to 7 days
  send_invitation_email?: boolean; // Defaults to true
  custom_message?: string; // Custom message in invitation email
}

/**
 * Create Registration Token Response DTO
 */
export interface CreateRegistrationTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    token: {
      id: string;
      token: string;
      generated_by_user_id: string;
      organization_id: string;
      status: TokenStatus;
      student_name?: string;
      student_email?: string;
      education_level?: EducationLevel;
      max_uses: number;
      current_uses: number;
      expires_at: Date;
      created_at: Date;
    };
    organization: {
      id: string;
      name: string;
    };
    invitation_email_sent: boolean;
    invitation_url: string;
  };
}

/**
 * Get Registration Tokens DTO
 * Query parameters for listing tokens
 */
export interface GetRegistrationTokensDto {
  page?: number;
  limit?: number;
  status?: TokenStatus;
  student_email?: string;
  education_level?: EducationLevel;
  expired?: boolean;
  used?: boolean;
  order_by?: 'created_at' | 'expires_at' | 'student_name';
  order_direction?: 'ASC' | 'DESC';
}

/**
 * Registration Token Details DTO
 */
export interface RegistrationTokenDetailsDto {
  id: string;
  token: string;
  generated_by_user_id: string;
  organization_id: string;
  status: TokenStatus;
  student_name?: string;
  student_email?: string;
  education_level?: EducationLevel;
  max_uses: number;
  current_uses: number;
  expires_at: Date;
  used_at?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Related data
  generated_by: {
    id: string;
    name: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    contact_email: string;
  };
  used_by?: {
    id: string;
    name: string;
    email: string;
    education_level: EducationLevel;
    created_at: Date;
  };
}

/**
 * Get Registration Tokens Response DTO
 */
export interface GetRegistrationTokensResponseDto {
  success: boolean;
  message: string;
  data: {
    tokens: RegistrationTokenDetailsDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      total_tokens: number;
      active_tokens: number;
      used_tokens: number;
      expired_tokens: number;
      revoked_tokens: number;
    };
  };
}

/**
 * Update Registration Token DTO
 */
export interface UpdateRegistrationTokenDto {
  student_name?: string;
  student_email?: string;
  education_level?: EducationLevel;
  max_uses?: number;
  expires_at?: Date;
  status?: TokenStatus;
}

/**
 * Update Registration Token Response DTO
 */
export interface UpdateRegistrationTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    token: RegistrationTokenDetailsDto;
  };
}

/**
 * Revoke Registration Token DTO
 */
export interface RevokeRegistrationTokenDto {
  token_id: string;
  reason?: string;
}

/**
 * Revoke Registration Token Response DTO
 */
export interface RevokeRegistrationTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    token_id: string;
    revoked_at: Date;
    reason?: string;
  };
}

/**
 * Resend Token Invitation DTO
 */
export interface ResendTokenInvitationDto {
  token_id: string;
  custom_message?: string;
}

/**
 * Resend Token Invitation Response DTO
 */
export interface ResendTokenInvitationResponseDto {
  success: boolean;
  message: string;
  data: {
    token_id: string;
    student_email: string;
    sent_at: Date;
    invitation_url: string;
  };
}

/**
 * Validate Registration Token DTO
 */
export interface ValidateRegistrationTokenDto {
  token: string;
}

/**
 * Validate Registration Token Response DTO
 */
export interface ValidateRegistrationTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    token?: {
      id: string;
      token: string;
      student_name?: string;
      student_email?: string;
      education_level?: EducationLevel;
      max_uses: number;
      current_uses: number;
      expires_at: Date;
      organization: {
        id: string;
        name: string;
        contact_email: string;
      };
    };
    errors?: string[];
  };
}

/**
 * Bulk Create Registration Tokens DTO
 */
export interface BulkCreateRegistrationTokensDto {
  tokens: Array<{
    student_name?: string;
    student_email?: string;
    education_level?: EducationLevel;
    custom_message?: string;
  }>;
  default_max_uses?: number;
  default_expires_in_days?: number;
  send_invitation_emails?: boolean;
}

/**
 * Bulk Create Registration Tokens Response DTO
 */
export interface BulkCreateRegistrationTokensResponseDto {
  success: boolean;
  message: string;
  data: {
    created_tokens: Array<{
      id: string;
      token: string;
      student_name?: string;
      student_email?: string;
      education_level?: EducationLevel;
      expires_at: Date;
      invitation_sent: boolean;
    }>;
    statistics: {
      total_requested: number;
      successfully_created: number;
      failed_to_create: number;
      emails_sent: number;
      emails_failed: number;
    };
    errors?: Array<{
      index: number;
      error: string;
      student_data: any;
    }>;
  };
}
