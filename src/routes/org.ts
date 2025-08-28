import express, { Request, Response } from 'express';
import { OrganizationService } from '../services/OrganizationService';
import { UserService } from '../services/UserService';
import { authenticate } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();
const organizationService = new OrganizationService();
const userService = new UserService();

/**
 * @route POST /api/organizations/setup
 * @desc Create organization profile for authenticated ORG_ADMIN
 * @access Private (ORG_ADMIN only)
 */
router.post('/setup', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const userId = req.user?.userId;
if (!userId) {
  throw new Error('User ID not found in request. User may not be authenticated.');
}
    const userRole = req.user.role;
    // Verify user is ORG_ADMIN
    if (userRole !== UserRole.ORG_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators can create organization profiles'
      });
      return;
    }
    const existingOrg = await organizationService.getOrganizationByAdminId(userId);
    if (existingOrg) {
      res.status(409).json({
        success: false,
        error: 'Organization profile already exists for this admin'
      });
      return;
    }

    const { name, contactEmail, contactPhone, address, description, website } = req.body;

    // Validate required fields
    if (!name || !contactEmail) {
      res.status(400).json({
        success: false,
        error: 'Organization name and contact email are required'
      });
      return;
    }

    // Create organization with admin reference
    const organizationData = {
      name,
      contactEmail,
      contactPhone,
      address,
      description,
      website,
      adminId: userId
    };

    const newOrganization = await organizationService.createOrganizationForAdmin(userId, organizationData);
    // Get the current user state before update
    const currentUser = await userService.getUserById(userId);
    if (!currentUser) {
      throw new Error(`Cannot find user with ID: ${userId}`);
    }

    // Mark user's organization setup as complete
    const updatedUser = await userService.updateUser(userId, { 
      organizationSetupComplete: true,
      organizationId: newOrganization.id
    });

    if (!updatedUser) {
      console.error('Update failed - no user returned');
      // If update failed, rollback by deleting the organization
      await organizationService.deleteOrganization(newOrganization.id);
      throw new Error('Failed to update user - no user returned');
    }

    if (!updatedUser.organizationSetupComplete) {
      console.error('Update failed - setup not marked complete', {
        user: updatedUser
      });
      // If update failed, rollback by deleting the organization
      await organizationService.deleteOrganization(newOrganization.id);
      throw new Error('Failed to mark organization setup as complete');
    }

    res.status(201).json({
      success: true,
      data: {
        organization: newOrganization,
        user: updatedUser,
        message: 'Organization profile created successfully'
      },
      message: 'Organization setup completed'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Organization setup failed'
    });
  }
});

/**
 * @route GET /api/organizations/setup-status
 * @desc Check if current user has completed organization setup
 * @access Private (ORG_ADMIN only)
 */
router.get('/setup-status', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Verify user is ORG_ADMIN
    if (userRole !== UserRole.ORG_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators can check setup status'
      });
      return;
    }

    const user = await userService.getUserById(userId);
    const organization = await organizationService.getOrganizationByAdminId(userId);

    res.status(200).json({
      success: true,
      data: {
        setupComplete: user?.organizationSetupComplete || false,
        hasOrganization: !!organization,
        organizationId: organization?.id || null
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check setup status'
    });
  }
});

export default router;
