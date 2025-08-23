import { EducationLevel, UserRole } from '../enums';

/**
 * Individual User Registration DTO
 * For users registering as individuals (not through an organization)
 */
export interface RegisterIndividualDto {
  name: string;
  username: string;
  email: string;
  password: string;
  education_level: EducationLevel;
  confirm_password: string;
  terms_accepted: boolean;
}

/**
 * Individual User Registration Response DTO
 */
export interface RegisterIndividualResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      role: UserRole;
      education_level: EducationLevel;
      is_org_ward: boolean;
      email_verified: boolean;
      created_at: Date;
    };
    verification_email_sent: boolean;
  };
}

/**
 * Organization Registration DTO
 * For organizations registering with their admin user
 */
export interface RegisterOrganizationDto {
  // Organization details
  organization_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
  
  // Admin user details
  admin_name: string;
  admin_username: string;
  admin_email: string;
  admin_password: string;
  confirm_password: string;
  
  // Legal/compliance
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
}

/**
 * Organization Registration Response DTO
 */
export interface RegisterOrganizationResponseDto {
  success: boolean;
  message: string;
  data: {
    organization: {
      id: string;
      name: string;
      contact_email: string;
      admin_id: string;
      is_active: boolean;
      created_at: Date;
    };
    admin_user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      organization_id: string;
      is_org_ward: boolean;
      email_verified: boolean;
      created_at: Date;
    };
    verification_email_sent: boolean;
  };
}

/**
 * Organizational Ward Registration DTO
 * For students registering using a token from their organization
 */
export interface RegisterOrgWardDto {
  token: string;
  name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  education_level: EducationLevel;
  terms_accepted: boolean;
}

/**
 * Organizational Ward Registration Response DTO
 */
export interface RegisterOrgWardResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      education_level: EducationLevel;
      organization_id: string;
      is_org_ward: boolean;
      email_verified: boolean;
      created_at: Date;
    };
    organization: {
      id: string;
      name: string;
      contact_email: string;
    };
    token_used: {
      id: string;
      token: string;
      used_at: Date;
    };
  };
}

/**
 * Login DTO
 * For all user types authentication
 */
export interface LoginDto {
  username: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Login Response DTO
 */
export interface LoginResponseDto {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
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
    };
    organization?: {
      id: string;
      name: string;
      contact_email: string;
    };
  };
}

/**
 * Token Refresh DTO
 */
export interface RefreshTokenDto {
  refresh_token: string;
}

/**
 * Token Refresh Response DTO
 */
export interface RefreshTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

/**
 * Logout DTO
 */
export interface LogoutDto {
  refresh_token?: string;
}

/**
 * Logout Response DTO
 */
export interface LogoutResponseDto {
  success: boolean;
  message: string;
}

/**
 * Email Verification DTO
 */
export interface VerifyEmailDto {
  token: string;
  email: string;
}

/**
 * Email Verification Response DTO
 */
export interface VerifyEmailResponseDto {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    email: string;
    verified_at: Date;
  };
}

/**
 * Resend Verification Email DTO
 */
export interface ResendVerificationDto {
  email: string;
}

/**
 * Resend Verification Email Response DTO
 */
export interface ResendVerificationResponseDto {
  success: boolean;
  message: string;
  data: {
    email: string;
    sent_at: Date;
  };
}

/**
 * Password Reset Request DTO
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Password Reset Request Response DTO
 */
export interface ForgotPasswordResponseDto {
  success: boolean;
  message: string;
  data: {
    email: string;
    reset_email_sent: boolean;
    sent_at: Date;
  };
}

/**
 * Password Reset DTO
 */
export interface ResetPasswordDto {
  token: string;
  email: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Password Reset Response DTO
 */
export interface ResetPasswordResponseDto {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    email: string;
    password_reset_at: Date;
  };
}

/**
 * Change Password DTO
 * For authenticated users changing their password
 */
export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Change Password Response DTO
 */
export interface ChangePasswordResponseDto {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    password_changed_at: Date;
  };
}
