import { AdminType, UserRole } from '../enums';

/**
 * Update Organization Details DTO
 * For org admins to update their organization information
 */
export interface UpdateOrganizationDto {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  website?: string;
}

/**
 * Update Organization Response DTO
 */
export interface UpdateOrganizationResponseDto {
  success: boolean;
  message: string;
  data: {
    organization: {
      id: string;
      name: string;
      contact_email: string;
      contact_phone?: string;
      address?: string;
      description?: string;
      website?: string;
      is_active: boolean;
      updated_at: Date;
    };
  };
}

/**
 * Get Organization Details DTO
 */
export interface GetOrganizationDetailsDto {
  include_statistics?: boolean;
  include_admin_details?: boolean;
  include_recent_activity?: boolean;
}

/**
 * Organization Details Response DTO
 */
export interface GetOrganizationDetailsResponseDto {
  success: boolean;
  message: string;
  data: {
    organization: {
      id: string;
      name: string;
      contact_email: string;
      contact_phone?: string;
      address?: string;
      description?: string;
      website?: string;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    };
    admin: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      is_active: boolean;
      last_login_at?: Date;
      created_at: Date;
    };
    statistics?: {
      total_wards: number;
      active_wards: number;
      inactive_wards: number;
      total_tokens_generated: number;
      active_tokens: number;
      used_tokens: number;
      expired_tokens: number;
      recent_registrations: number; // Last 30 days
      recent_logins: number; // Last 7 days
    };
    recent_activity?: Array<{
      activity_type: 'WARD_REGISTERED' | 'TOKEN_GENERATED' | 'WARD_LOGIN' | 'ORGANIZATION_UPDATED';
      description: string;
      user_involved?: {
        id: string;
        name: string;
        email: string;
      };
      created_at: Date;
    }>;
  };
}

/**
 * Get Organization Statistics DTO
 */
export interface GetOrganizationStatisticsDto {
  time_period?: 'week' | 'month' | 'quarter' | 'year';
  group_by?: 'day' | 'week' | 'month';
}

/**
 * Organization Statistics Response DTO
 */
export interface GetOrganizationStatisticsResponseDto {
  success: boolean;
  message: string;
  data: {
    overview: {
      total_wards: number;
      active_wards: number;
      total_tokens: number;
      active_tokens: number;
    };
    ward_statistics: {
      by_education_level: Record<string, number>;
      by_registration_month: Array<{
        month: string;
        count: number;
      }>;
      by_status: {
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
      };
    };
    token_statistics: {
      generated_by_month: Array<{
        month: string;
        count: number;
      }>;
      usage_rate: number; // Percentage of tokens that have been used
      average_usage_time: number; // Average days between generation and usage
    };
    engagement_statistics: {
      login_frequency: Array<{
        date: string;
        unique_logins: number;
      }>;
      most_active_wards: Array<{
        id: string;
        name: string;
        email: string;
        login_count: number;
        last_login: Date;
      }>;
    };
  };
}

/**
 * Add Organization Admin DTO
 * For super admins to add additional admins to organizations
 */
export interface AddOrganizationAdminDto {
  organization_id: string;
  user_id: string;
  admin_type: AdminType;
  permissions?: string[];
}

/**
 * Add Organization Admin Response DTO
 */
export interface AddOrganizationAdminResponseDto {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      user_id: string;
      admin_type: AdminType;
      organization_id: string;
      permissions?: string[];
      is_active: boolean;
      created_at: Date;
    };
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  };
}

/**
 * Remove Organization Admin DTO
 */
export interface RemoveOrganizationAdminDto {
  admin_id: string;
  reason?: string;
}

/**
 * Remove Organization Admin Response DTO
 */
export interface RemoveOrganizationAdminResponseDto {
  success: boolean;
  message: string;
  data: {
    admin_id: string;
    removed_at: Date;
    reason?: string;
  };
}

/**
 * Deactivate Organization DTO
 * For super admins to deactivate organizations
 */
export interface DeactivateOrganizationDto {
  organization_id: string;
  reason: string;
  notify_admin: boolean;
  notify_wards: boolean;
}

/**
 * Deactivate Organization Response DTO
 */
export interface DeactivateOrganizationResponseDto {
  success: boolean;
  message: string;
  data: {
    organization: {
      id: string;
      name: string;
      is_active: boolean;
      deactivated_at: Date;
    };
    reason: string;
    notifications_sent: {
      admin_notified: boolean;
      wards_notified: number;
    };
  };
}

/**
 * Reactivate Organization DTO
 */
export interface ReactivateOrganizationDto {
  organization_id: string;
  reason?: string;
  notify_admin: boolean;
  notify_wards: boolean;
}

/**
 * Reactivate Organization Response DTO
 */
export interface ReactivateOrganizationResponseDto {
  success: boolean;
  message: string;
  data: {
    organization: {
      id: string;
      name: string;
      is_active: boolean;
      reactivated_at: Date;
    };
    reason?: string;
    notifications_sent: {
      admin_notified: boolean;
      wards_notified: number;
    };
  };
}

/**
 * Export Organization Data DTO
 * For org admins to export their organization's data
 */
export interface ExportOrganizationDataDto {
  format: 'CSV' | 'JSON' | 'XLSX';
  include_wards: boolean;
  include_tokens: boolean;
  include_activity_logs: boolean;
  date_range?: {
    from: Date;
    to: Date;
  };
}

/**
 * Export Organization Data Response DTO
 */
export interface ExportOrganizationDataResponseDto {
  success: boolean;
  message: string;
  data: {
    export_id: string;
    format: string;
    file_url: string;
    expires_at: Date;
    created_at: Date;
    file_size: number;
    records_included: {
      organization: number;
      wards: number;
      tokens: number;
      activity_logs: number;
    };
  };
}
