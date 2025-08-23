import express, { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { OrganizationService } from '../services/OrganizationService';
import { authenticate, optionalAuth } from '../middleware/auth';
import { LoginCredentials, RefreshTokenPayload } from '../types/database';
import { RegisterIndividualDto, RegisterOrganizationDto, RegisterOrgWardDto, UserRole } from '../models';

const router = express.Router();
const userService = new UserService();
const organizationService = new OrganizationService();

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password }: LoginCredentials = req.body;
    console.log('Login attempt:', { username, password });
    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
      return;
    }

    const authData = await userService.login({ username, password });

    res.json({
      success: true,
      data: authData,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token }: RefreshTokenPayload = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
      return;
    }

    const authData = await userService.refreshToken(refresh_token);

    res.json({
      success: true,
      data: authData,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const user = await userService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user,
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user profile'
    });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
      return;
    }

    await userService.changePassword(req.user.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password'
    });
  }
});

/**
 * @route POST /api/auth/register/individual
 * @desc Register individual user
 * @access Public
 */
router.post('/register/individual', async (req: Request, res: Response): Promise<void> => {
  try {
    const registrationData: RegisterIndividualDto = req.body;

    // Validate required fields
    const { name, username, email, password, confirm_password, education_level, terms_accepted } = registrationData;

    if (!name || !username || !email || !password || !confirm_password || !education_level || !terms_accepted) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
      return;
    }

    if (!terms_accepted) {
      res.status(400).json({
        success: false,
        error: 'You must accept the terms and conditions'
      });
      return;
    }

    // Create individual user
    const user = await userService.createUser({
      name,
      username,
      email,
      password_hash: password, // Will be hashed in the service
      education_level, // ← ADD THIS MISSING FIELD
      role: UserRole.INDIVIDUAL,
      is_active: true,
      email_verified: false
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          education_level: education_level,
          is_org_ward: false,
          email_verified: user.email_verified,
          created_at: user.created_at
        },
        verification_email_sent: false
      },
      message: 'Individual registration successful'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

/**
 * @route POST /api/auth/register/organization
 * @desc Register organization
 * @access Public
 */
router.post('/register/organization', async (req: Request, res: Response): Promise<void> => {
  try {
    const registrationData: RegisterOrganizationDto = req.body;

    // Validate required fields
    const { 
      organization_name, 
      contact_email,
      admin_name, 
      admin_username,
      admin_email, 
      admin_password, 
      confirm_password, 
      terms_accepted 
    } = registrationData;

    if (!organization_name || !contact_email || !admin_name || !admin_username || !admin_email || !admin_password || !confirm_password || !terms_accepted) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    if (admin_password !== confirm_password) {
      res.status(400).json({
        success: false,
        error: 'Admin passwords do not match'
      });
      return;
    }

    if (!terms_accepted) {
      res.status(400).json({
        success: false,
        error: 'You must accept the terms and conditions'
      });
      return;
    }

    // Create organization and admin user
    const organizationData: any = {
      name: organization_name,
      contact_email: contact_email,
      admin_name: admin_name,
      admin_username: admin_username,
      admin_email: admin_email,
      admin_password: admin_password,
    };

    // Only add optional fields if they have values
    if (registrationData.description) {
      organizationData.description = registrationData.description;
    }
    if (registrationData.website) {
      organizationData.website = registrationData.website;
    }
    if (registrationData.contact_phone) {
      organizationData.contact_phone = registrationData.contact_phone;
    }
    if (registrationData.address) {
      organizationData.address = registrationData.address;
    }

    const result = await organizationService.createOrganization(organizationData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Organization registration successful'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

/**
 * @route POST /api/auth/register/org-ward
 * @desc Register organization ward student
 * @access Public
 */
router.post('/register/org-ward', async (req: Request, res: Response): Promise<void> => {
  try {
    const registrationData: RegisterOrgWardDto = req.body;

    // Validate required fields
    const { 
      token,
      name, 
      username,
      email, 
      password, 
      confirm_password, 
      education_level,
      terms_accepted 
    } = registrationData;

    if (!token || !name || !username || !email || !password || !confirm_password || !education_level || !terms_accepted) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
      return;
    }

    if (!terms_accepted) {
      res.status(400).json({
        success: false,
        error: 'You must accept the terms and conditions'
      });
      return;
    }

    // TODO: Implement org ward registration with token validation
    // This would involve:
    // 1. Validating the token
    // 2. Getting the organization from the token
    // 3. Creating the user with ORG_WARD role
    // 4. Marking the token as used

    res.status(501).json({
      success: false,
      error: 'Organization ward registration not yet implemented'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc User logout (client-side token invalidation)
 * @access Private
 */
router.post('/logout', optionalAuth, (req: Request, res: Response): void => {
  // In a stateless JWT setup, logout is handled client-side by removing the token
  // In a more secure setup, you might want to blacklist tokens server-side
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route POST /api/auth/create-ward
 * @desc Organization admin creates a new ward (student)
 * @access Private (ORG_ADMIN only)
 */
router.post('/create-ward', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = req.user;
    
    if (!admin || admin.role !== UserRole.ORG_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators can create wards'
      });
      return;
    }

    const { name, email, educationLevel } = req.body;

    if (!name || !email || !educationLevel) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and education level are required'
      });
      return;
    }

    const ward = await userService.createWard({
      name,
      email,
      educationLevel,
      organizationId: admin.organization_id!
    });

    res.json({
      success: true,
      data: ward,
      message: 'Ward created successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ward'
    });
  }
});

/**
 * @route POST /api/auth/create-wards-bulk
 * @desc Organization admin creates multiple wards from CSV data
 * @access Private (ORG_ADMIN only)
 */
router.post('/create-wards-bulk', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = req.user;
    
    if (!admin || admin.role !== UserRole.ORG_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators can create wards'
      });
      return;
    }

    const { wards } = req.body;

    if (!wards || !Array.isArray(wards) || wards.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Wards array is required and must not be empty'
      });
      return;
    }

    const createdWards = await userService.createWardsBulk({
      wards,
      organizationId: admin.organization_id!
    });

    res.json({
      success: true,
      data: { wards: createdWards },
      message: `${createdWards.length} wards created successfully`
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create wards'
    });
  }
});

/**
 * @route GET /api/auth/organization-wards
 * @desc Get all wards for the organization
 * @access Private (ORG_ADMIN only)
 */
router.get('/organization-wards', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = req.user;
    
    if (!admin || admin.role !== UserRole.ORG_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators can view wards'
      });
      return;
    }

    const wards = await userService.getOrganizationWards(admin.organization_id!);

    res.json({
      success: true,
      data: { wards },
      message: 'Organization wards retrieved successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve wards'
    });
  }
});

/**
 * @route POST /api/auth/assign-wards-credentials
 * @desc Send credentials to all unassigned wards via email
 * @access Private (ORG_ADMIN only)
 */
router.post('/assign-wards-credentials', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = req.user;
    
    if (!admin || admin.role !== UserRole.ORG_ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only organization administrators can assign credentials'
      });
      return;
    }

    const result = await userService.assignWardsCredentials(admin.organization_id!);

    res.json({
      success: true,
      data: result,
      message: 'Ward credentials assigned successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign credentials'
    });
  }
});

export default router;
