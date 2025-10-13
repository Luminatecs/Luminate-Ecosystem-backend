/**
 * Student Enrollment Service
 * Handles single and bulk student enrollments, creates ORG_WARD users, guardians, and temporary credentials
 */

import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../uitls/queryutils/database';
import { BulkEnrollmentData } from '../utils/csvValidator';
import { guardianService } from './GuardianService';
import { temporaryCredentialService } from './TemporaryCredentialService';
import { emailService } from './EmailService';

interface EnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  userId?: string;
  guardianId?: string;
  tempCode?: string;
  message: string;
  errors?: string[];
}

interface BulkEnrollmentResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    studentName: string;
    success: boolean;
    message: string;
    enrollmentId?: string;
  }>;
}

export class StudentEnrollmentService {
  /**
   * Create a single student enrollment
   */
  async createSingleEnrollment(
    organizationId: string,
    createdBy: string,
    data: BulkEnrollmentData
  ): Promise<EnrollmentResult> {
    try {
      const result = await db.transaction(async (client) => {
        console.log('📝 StudentEnrollmentService: Creating single enrollment for', 
          `${data.student.firstName} ${data.student.lastName}`);

        // Step 1: Get organization name
        const orgQuery = `SELECT name FROM organizations WHERE id = $1 AND deleted_at IS NULL`;
        const orgResult = await client.query(orgQuery, [organizationId]);

        if (orgResult.rows.length === 0) {
          throw new Error('Organization not found');
        }

        const organizationName = orgResult.rows[0].name;

        // Step 2: Create ORG_WARD user
        const userId = randomUUID();
        const tempUsername = `ward_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);

        const createUserQuery = `
          INSERT INTO users 
          (id, username, password, first_name, last_name, email, phone, role, organization_id, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'ORG_WARD', $8, $9)
          RETURNING id
        `;

        await client.query(createUserQuery, [
          userId,
          tempUsername,
          tempPassword,
          data.student.firstName,
          data.student.lastName,
          data.student.email || null,
          data.student.phone || null,
          organizationId,
          createdBy
        ]);

        console.log('✅ StudentEnrollmentService: Created ORG_WARD user', userId);

        // Step 3: Create student enrollment record
        const enrollmentId = randomUUID();
        const createEnrollmentQuery = `
          INSERT INTO student_enrollments 
          (id, organization_id, student_id, enrollment_status, academic_year, grade_level, created_by)
          VALUES ($1, $2, $3, 'PENDING', $4, $5, $6)
          RETURNING id
        `;

        await client.query(createEnrollmentQuery, [
          enrollmentId,
          organizationId,
          userId,
          data.enrollment.academicYear,
          data.enrollment.gradeLevel,
          createdBy
        ]);

        console.log('✅ StudentEnrollmentService: Created enrollment record', enrollmentId);

        // Step 4: Create guardian record
        const guardianId = randomUUID();
        const createGuardianQuery = `
          INSERT INTO guardians 
          (id, student_id, first_name, last_name, email, phone, relation, age)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `;

        await client.query(createGuardianQuery, [
          guardianId,
          userId,
          data.guardian.firstName,
          data.guardian.lastName,
          data.guardian.email,
          data.guardian.phone,
          data.guardian.relation,
          data.guardian.age
        ]);

        console.log('✅ StudentEnrollmentService: Created guardian record', guardianId);

        // Step 5: Generate temporary credentials
        const tempCredentials = await temporaryCredentialService.generateTempCredentials(userId);

        if (!tempCredentials.tempCode || !tempCredentials.tempPassword) {
          throw new Error('Failed to generate temporary credentials');
        }

        console.log('✅ StudentEnrollmentService: Generated temporary credentials');

        return {
          enrollmentId,
          userId,
          guardianId,
          tempCode: tempCredentials.tempCode,
          tempPassword: tempCredentials.tempPassword,
          expiresAt: tempCredentials.expiresAt,
          organizationName
        };
      });

      // Step 6: Send email to guardian (outside transaction)
      await emailService.sendGuardianCredentials({
        guardianName: `${data.guardian.firstName} ${data.guardian.lastName}`,
        guardianEmail: data.guardian.email,
        studentName: `${data.student.firstName} ${data.student.lastName}`,
        tempCode: result.tempCode,
        tempPassword: result.tempPassword,
        organizationName: result.organizationName,
        expiryDate: result.expiresAt
      });

      console.log('✅ StudentEnrollmentService: Sent credentials email to guardian');

      return {
        success: true,
        enrollmentId: result.enrollmentId,
        userId: result.userId,
        guardianId: result.guardianId,
        tempCode: result.tempCode,
        message: 'Student enrollment created successfully'
      };
    } catch (error) {
      console.error('❌ StudentEnrollmentService: Failed to create enrollment', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create enrollment',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Process bulk enrollment from CSV data
   */
  async processBulkEnrollment(
    organizationId: string,
    createdBy: string,
    bulkData: BulkEnrollmentData[]
  ): Promise<BulkEnrollmentResult> {
    console.log(`📊 StudentEnrollmentService: Processing bulk enrollment for ${bulkData.length} students`);

    const results: Array<{
      studentName: string;
      success: boolean;
      message: string;
      enrollmentId?: string;
    }> = [];

    let successful = 0;
    let failed = 0;

    for (const data of bulkData) {
      const studentName = `${data.student.firstName} ${data.student.lastName}`;

      try {
        const result = await this.createSingleEnrollment(organizationId, createdBy, data);

        if (result.success) {
          successful++;
          results.push({
            studentName,
            success: true,
            message: 'Enrollment created successfully',
            enrollmentId: result.enrollmentId
          });
        } else {
          failed++;
          results.push({
            studentName,
            success: false,
            message: result.message
          });
        }
      } catch (error) {
        failed++;
        results.push({
          studentName,
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create enrollment'
        });
      }
    }

    console.log(`✅ StudentEnrollmentService: Bulk enrollment complete - ${successful} successful, ${failed} failed`);

    return {
      totalProcessed: bulkData.length,
      successful,
      failed,
      results
    };
  }

  /**
   * Get all enrollments for an organization
   */
  async getEnrollmentsByOrganization(
    organizationId: string,
    filters?: {
      status?: string;
      academicYear?: string;
      gradeLevel?: string;
    }
  ): Promise<any[]> {
    try {
      console.log('🔍 StudentEnrollmentService: Getting enrollments for organization', organizationId);

      let query = `
        SELECT 
          se.*,
          u.first_name as student_first_name,
          u.last_name as student_last_name,
          u.email as student_email,
          u.phone as student_phone,
          g.first_name as guardian_first_name,
          g.last_name as guardian_last_name,
          g.email as guardian_email,
          g.phone as guardian_phone,
          g.relation as guardian_relation
        FROM student_enrollments se
        JOIN users u ON se.student_id = u.id
        LEFT JOIN guardians g ON u.id = g.student_id
        WHERE se.organization_id = $1 AND se.deleted_at IS NULL
      `;

      const params: any[] = [organizationId];
      let paramIndex = 2;

      if (filters?.status) {
        query += ` AND se.enrollment_status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.academicYear) {
        query += ` AND se.academic_year = $${paramIndex}`;
        params.push(filters.academicYear);
        paramIndex++;
      }

      if (filters?.gradeLevel) {
        query += ` AND se.grade_level = $${paramIndex}`;
        params.push(filters.gradeLevel);
        paramIndex++;
      }

      query += ` ORDER BY se.created_at DESC`;

      const result = await db.query(query, params);

      console.log(`✅ StudentEnrollmentService: Found ${result.rows.length} enrollments`);

      return result.rows;
    } catch (error) {
      console.error('❌ StudentEnrollmentService: Failed to get enrollments', error);
      throw error;
    }
  }

  /**
   * Update enrollment status
   */
  async updateEnrollmentStatus(
    enrollmentId: string,
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'WITHDRAWN',
    updatedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📝 StudentEnrollmentService: Updating enrollment status', enrollmentId, status);

      const query = `
        UPDATE student_enrollments 
        SET enrollment_status = $1, updated_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id
      `;

      const result = await db.query(query, [status, enrollmentId]);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Enrollment not found'
        };
      }

      console.log('✅ StudentEnrollmentService: Enrollment status updated');

      return {
        success: true,
        message: 'Enrollment status updated successfully'
      };
    } catch (error) {
      console.error('❌ StudentEnrollmentService: Failed to update enrollment status', error);
      return {
        success: false,
        message: 'Failed to update enrollment status'
      };
    }
  }

  /**
   * Delete enrollment (soft delete)
   */
  async deleteEnrollment(
    enrollmentId: string,
    deletedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️  StudentEnrollmentService: Deleting enrollment', enrollmentId);

      const query = `
        UPDATE student_enrollments 
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `;

      const result = await db.query(query, [enrollmentId]);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Enrollment not found or already deleted'
        };
      }

      console.log('✅ StudentEnrollmentService: Enrollment deleted');

      return {
        success: true,
        message: 'Enrollment deleted successfully'
      };
    } catch (error) {
      console.error('❌ StudentEnrollmentService: Failed to delete enrollment', error);
      return {
        success: false,
        message: 'Failed to delete enrollment'
      };
    }
  }

  /**
   * Get enrollment statistics for an organization
   */
  async getEnrollmentStats(organizationId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byGradeLevel: Record<string, number>;
  }> {
    try {
      console.log('📊 StudentEnrollmentService: Getting enrollment stats for organization', organizationId);

      // Total count
      const totalQuery = `
        SELECT COUNT(*) as count 
        FROM student_enrollments 
        WHERE organization_id = $1 AND deleted_at IS NULL
      `;
      const totalResult = await db.query(totalQuery, [organizationId]);
      const total = parseInt(totalResult.rows[0].count, 10);

      // By status
      const statusQuery = `
        SELECT enrollment_status, COUNT(*) as count 
        FROM student_enrollments 
        WHERE organization_id = $1 AND deleted_at IS NULL 
        GROUP BY enrollment_status
      `;
      const statusResult = await db.query(statusQuery, [organizationId]);
      const byStatus: Record<string, number> = {};
      statusResult.rows.forEach(row => {
        byStatus[row.enrollment_status] = parseInt(row.count, 10);
      });

      // By grade level
      const gradeQuery = `
        SELECT grade_level, COUNT(*) as count 
        FROM student_enrollments 
        WHERE organization_id = $1 AND deleted_at IS NULL 
        GROUP BY grade_level
      `;
      const gradeResult = await db.query(gradeQuery, [organizationId]);
      const byGradeLevel: Record<string, number> = {};
      gradeResult.rows.forEach(row => {
        byGradeLevel[row.grade_level] = parseInt(row.count, 10);
      });

      console.log('✅ StudentEnrollmentService: Enrollment stats retrieved');

      return {
        total,
        byStatus,
        byGradeLevel
      };
    } catch (error) {
      console.error('❌ StudentEnrollmentService: Failed to get enrollment stats', error);
      throw error;
    }
  }
}

export const studentEnrollmentService = new StudentEnrollmentService();
