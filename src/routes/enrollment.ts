/**
 * Enrollment Routes
 * API endpoints for student enrollment management
 */

import express, { Request, Response } from 'express';
import { studentEnrollmentService } from '../services/StudentEnrollmentService';
import { csvService } from '../services/CSVService';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/enrollment/single
 * Create a single student enrollment
 */
router.post('/single', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { organizationId, enrollmentData } = req.body;
    const createdBy = req.user!.userId;

    console.log('📝 API: Creating single enrollment', { organizationId, createdBy });

    if (!organizationId || !enrollmentData) {
      res.status(400).json({
        success: false,
        error: 'Organization ID and enrollment data are required'
      });
      return;
    }

    const result = await studentEnrollmentService.createSingleEnrollment(
      organizationId,
      createdBy,
      enrollmentData
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          enrollmentId: result.enrollmentId,
          userId: result.userId,
          guardianId: result.guardianId,
          tempCode: result.tempCode
        },
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
        errors: result.errors
      });
    }
  } catch (error) {
    console.error('❌ API: Error creating single enrollment', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create enrollment'
    });
  }
});

/**
 * POST /api/enrollment/bulk
 * Process bulk enrollment from CSV data
 */
router.post('/bulk', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { organizationId, enrollmentData } = req.body;
    const createdBy = req.user!.userId;

    console.log('📊 API: Processing bulk enrollment', { 
      organizationId, 
      createdBy,
      count: enrollmentData?.length 
    });

    if (!organizationId || !enrollmentData || !Array.isArray(enrollmentData)) {
      res.status(400).json({
        success: false,
        error: 'Organization ID and enrollment data array are required'
      });
      return;
    }

    const result = await studentEnrollmentService.processBulkEnrollment(
      organizationId,
      createdBy,
      enrollmentData
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ API: Error processing bulk enrollment', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process bulk enrollment'
    });
  }
});

/**
 * GET /api/enrollment/organization/:organizationId
 * Get all enrollments for an organization
 */
router.get('/organization/:organizationId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const { status, academicYear, gradeLevel } = req.query;

    console.log('🔍 API: Getting enrollments for organization', { 
      organizationId,
      filters: { status, academicYear, gradeLevel }
    });

    const filters: any = {};
    if (status) filters.status = status as string;
    if (academicYear) filters.academicYear = academicYear as string;
    if (gradeLevel) filters.gradeLevel = gradeLevel as string;

    const enrollments = await studentEnrollmentService.getEnrollmentsByOrganization(
      organizationId,
      filters
    );

    res.status(200).json({
      success: true,
      data: enrollments,
      count: enrollments.length
    });
  } catch (error) {
    console.error('❌ API: Error getting enrollments', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get enrollments'
    });
  }
});

/**
 * PUT /api/enrollment/:enrollmentId/status
 * Update enrollment status
 */
router.put('/:enrollmentId/status', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;
    const updatedBy = req.user!.userId;

    console.log('📝 API: Updating enrollment status', { enrollmentId, status, updatedBy });

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status is required'
      });
      return;
    }

    const validStatuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    const result = await studentEnrollmentService.updateEnrollmentStatus(
      enrollmentId,
      status,
      updatedBy
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ API: Error updating enrollment status', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update enrollment status'
    });
  }
});

/**
 * DELETE /api/enrollment/:enrollmentId
 * Delete (soft delete) an enrollment
 */
router.delete('/:enrollmentId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const deletedBy = req.user!.userId;

    console.log('🗑️  API: Deleting enrollment', { enrollmentId, deletedBy });

    const result = await studentEnrollmentService.deleteEnrollment(enrollmentId, deletedBy);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ API: Error deleting enrollment', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete enrollment'
    });
  }
});

/**
 * GET /api/enrollment/stats/:organizationId
 * Get enrollment statistics for an organization
 */
router.get('/stats/:organizationId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    console.log('📊 API: Getting enrollment stats', { organizationId });

    const stats = await studentEnrollmentService.getEnrollmentStats(organizationId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ API: Error getting enrollment stats', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get enrollment stats'
    });
  }
});

/**
 * GET /api/enrollment/csv/template
 * Download CSV template for bulk enrollment
 */
router.get('/csv/template', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('📄 API: Generating CSV template');

    const template = await csvService.generateTemplate();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student-enrollment-template.csv');
    res.status(200).send(template);
  } catch (error) {
    console.error('❌ API: Error generating CSV template', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate CSV template'
    });
  }
});

/**
 * POST /api/enrollment/csv/validate
 * Validate CSV file content
 */
router.post('/csv/validate', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { csvContent } = req.body;

    console.log('🔍 API: Validating CSV content');

    if (!csvContent) {
      res.status(400).json({
        success: false,
        error: 'CSV content is required'
      });
      return;
    }

    const result = await csvService.processCSVFile(csvContent);

    res.status(200).json({
      success: true,
      data: {
        validCount: result.valid.length,
        errorCount: result.errors.length,
        validData: result.valid,
        errors: result.errors
      }
    });
  } catch (error) {
    console.error('❌ API: Error validating CSV', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate CSV'
    });
  }
});

export default router;
