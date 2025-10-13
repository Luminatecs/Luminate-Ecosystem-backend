/**
 * Guardian Service
 * Handles guardian/parent information management for org ward students
 */

import { db } from '../uitls/queryutils/database';
import { Guardian, CreateGuardianDTO, UpdateGuardianDTO, GuardianValidation } from '../models/Guardian';

export class GuardianService {
  /**
   * Create a new guardian record
   */
  async createGuardian(data: CreateGuardianDTO): Promise<Guardian> {
    try {
      // Validate data
      if (!GuardianValidation.isValidEmail(data.email)) {
        throw new Error('Invalid guardian email format');
      }

      if (data.phone && !GuardianValidation.isValidPhone(data.phone)) {
        throw new Error('Invalid guardian phone format');
      }

      if (!GuardianValidation.isValidRelation(data.relation)) {
        throw new Error('Invalid guardian relation');
      }

      // Create guardian
      const guardian = await db.insert<Guardian>('guardians', {
        student_id: data.studentId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        relation: data.relation,
        age: data.age,
        created_at: new Date(),
        updated_at: new Date()
      });

      console.log('✅ GuardianService: Guardian created successfully', { 
        guardianId: guardian.id, 
        studentId: data.studentId 
      });

      return guardian;
    } catch (error) {
      console.error('❌ GuardianService: Failed to create guardian', error);
      throw error;
    }
  }

  /**
   * Get all guardians for a student
   */
  async getGuardiansByStudent(studentId: string): Promise<Guardian[]> {
    try {
      const query = `
        SELECT 
          id,
          student_id as "studentId",
          name,
          email,
          phone,
          relation,
          age,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM guardians
        WHERE student_id = $1
        ORDER BY created_at DESC
      `;

      const result = await db.query<Guardian>(query, [studentId]);
      
      console.log('📊 GuardianService: Retrieved guardians for student', { 
        studentId, 
        count: result.rows.length 
      });

      return result.rows;
    } catch (error) {
      console.error('❌ GuardianService: Failed to get guardians by student', error);
      throw error;
    }
  }

  /**
   * Get guardian by ID
   */
  async getGuardianById(guardianId: string): Promise<Guardian | null> {
    try {
      const query = `
        SELECT 
          id,
          student_id as "studentId",
          name,
          email,
          phone,
          relation,
          age,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM guardians
        WHERE id = $1
      `;

      const result = await db.query<Guardian>(query, [guardianId]);

      if (result.rows.length === 0) {
        console.warn('⚠️  GuardianService: Guardian not found', { guardianId });
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ GuardianService: Failed to get guardian by ID', error);
      throw error;
    }
  }

  /**
   * Update guardian information
   */
  async updateGuardian(guardianId: string, data: UpdateGuardianDTO): Promise<Guardian> {
    try {
      // Validate data if provided
      if (data.email && !GuardianValidation.isValidEmail(data.email)) {
        throw new Error('Invalid guardian email format');
      }

      if (data.phone && !GuardianValidation.isValidPhone(data.phone)) {
        throw new Error('Invalid guardian phone format');
      }

      if (data.relation && !GuardianValidation.isValidRelation(data.relation)) {
        throw new Error('Invalid guardian relation');
      }

      const updateData: any = {
        ...data,
        updated_at: new Date()
      };

      const guardian = await db.update<Guardian>('guardians', guardianId, updateData);

      if (!guardian) {
        throw new Error('Guardian not found');
      }

      console.log('✅ GuardianService: Guardian updated successfully', { guardianId });

      return guardian;
    } catch (error) {
      console.error('❌ GuardianService: Failed to update guardian', error);
      throw error;
    }
  }

  /**
   * Delete guardian
   */
  async deleteGuardian(guardianId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM guardians WHERE id = $1`;
      const result = await db.query(query, [guardianId]);

      const deleted = result.rowCount > 0;

      if (deleted) {
        console.log('✅ GuardianService: Guardian deleted successfully', { guardianId });
      } else {
        console.warn('⚠️  GuardianService: Guardian not found for deletion', { guardianId });
      }

      return deleted;
    } catch (error) {
      console.error('❌ GuardianService: Failed to delete guardian', error);
      throw error;
    }
  }

  /**
   * Validate guardian email uniqueness for a student
   */
  async validateGuardianEmail(studentId: string, email: string): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM guardians
        WHERE student_id = $1 AND email = $2
      `;

      const result = await db.query<{ count: string }>(query, [studentId, email]);
      const count = parseInt(result.rows[0].count, 10);

      return count === 0;
    } catch (error) {
      console.error('❌ GuardianService: Failed to validate guardian email', error);
      throw error;
    }
  }

  /**
   * Get primary guardian for a student (first guardian created)
   */
  async getPrimaryGuardian(studentId: string): Promise<Guardian | null> {
    try {
      const query = `
        SELECT 
          id,
          student_id as "studentId",
          name,
          email,
          phone,
          relation,
          age,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM guardians
        WHERE student_id = $1
        ORDER BY created_at ASC
        LIMIT 1
      `;

      const result = await db.query<Guardian>(query, [studentId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ GuardianService: Failed to get primary guardian', error);
      throw error;
    }
  }
}

export const guardianService = new GuardianService();
