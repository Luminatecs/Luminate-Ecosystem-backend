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
    // Verify user is ORG_ADMIN or SUPER_ADMIN
    if (userRole !== UserRole.ORG_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators and super admins can create organization profiles'
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

    // Verify user is ORG_ADMIN or SUPER_ADMIN
    if (userRole !== UserRole.ORG_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators and super admins can check setup status'
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

/**
 * @route GET /api/organizations
 * @desc Get all organizations (paginated)
 * @access Private (SUPER_ADMIN, ACCESS_ADMIN only)
 */
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const userRole = req.user.role;

    // Verify user has administrative access
    if (userRole !== UserRole.SUPER_ADMIN && 
        userRole !== UserRole.ACCESS_ADMIN && 
        userRole !== UserRole.ORG_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only administrators can view organizations'
      });
      return;
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const search = req.query.search as string;

    const queryOptions = {
      page,
      limit,
      search,
      sortBy: req.query.sortBy as string || 'name',
      sortOrder: ((req.query.sortOrder as string)?.toUpperCase() || 'ASC') as 'ASC' | 'DESC'
    };

    const result = await organizationService.getOrganizations(queryOptions);

    res.status(200).json({
      success: true,
      message: 'Organizations retrieved successfully',
      data: {
        data: result.data,
        pagination: {
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve organizations'
    });
  }
});

/**
 * @route GET /api/organizations/:id
 * @desc Get organization by ID
 * @access Private (SUPER_ADMIN, ACCESS_ADMIN, or organization's ORG_ADMIN)
 */
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const organization = await organizationService.getOrganizationById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
      return;
    }

    // Check authorization: SUPER_ADMIN, ACCESS_ADMIN, or organization's admin
    if (
      userRole !== UserRole.SUPER_ADMIN && 
      userRole !== UserRole.ACCESS_ADMIN && 
      organization.adminId !== userId
    ) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to view this organization'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Organization retrieved successfully',
      data: organization
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve organization'
    });
  }
});

/**
 * @route PUT /api/organizations/:id
 * @desc Update organization by ID
 * @access Private (SUPER_ADMIN, ACCESS_ADMIN, or organization's ORG_ADMIN)
 */
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get organization first to check ownership
    const organization = await organizationService.getOrganizationById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
      return;
    }

    // Check authorization: SUPER_ADMIN, ACCESS_ADMIN, or organization's admin
    if (
      userRole !== UserRole.SUPER_ADMIN && 
      userRole !== UserRole.ACCESS_ADMIN && 
      organization.adminId !== userId
    ) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to update this organization'
      });
      return;
    }

    const updateData = req.body;

    // Prevent changing adminId through this endpoint
    if (updateData.adminId && updateData.adminId !== organization.adminId) {
      res.status(400).json({
        success: false,
        error: 'Cannot change organization administrator through this endpoint'
      });
      return;
    }

    const updatedOrganization = await organizationService.updateOrganization(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: updatedOrganization
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update organization'
    });
  }
});

export default router;
