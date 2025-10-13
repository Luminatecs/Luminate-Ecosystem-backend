/**
 * Student Enrollment Model
 * Tracks student enrollment in organizations
 */

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface StudentEnrollment {
  id: string;
  organizationId: string; // CRITICAL: Institution/Organization ID - ALWAYS stored
  studentId: string;
  enrollmentStatus: EnrollmentStatus;
  enrollmentDate: Date;
  academicYear: string;
  gradeLevel: string;
  createdBy: string; // Org Admin who created this enrollment
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEnrollmentDTO {
  organizationId: string; // REQUIRED: Institution/Organization ID
  studentId: string;
  academicYear: string;
  gradeLevel: string;
  createdBy: string;
}

export interface UpdateEnrollmentDTO {
  enrollmentStatus?: EnrollmentStatus;
  academicYear?: string;
  gradeLevel?: string;
}

export interface EnrollmentWithDetails extends StudentEnrollment {
  studentName: string;
  studentEmail: string;
  organizationName: string;
  createdByName: string;
}
