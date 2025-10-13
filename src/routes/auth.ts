import express, { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { OrganizationService } from '../services/OrganizationService';
import { passwordResetService } from '../services/PasswordResetService';
import { authenticate, optionalAuth } from '../middleware/auth';
import { LoginCredentials, RefreshTokenPayload } from '../types/database';
import { RegisterIndividualDto, RegisterOrganizationDto, RegisterOrgWardDto, UserRole } from '../models';

const router = express.Router();
const userService = new UserService();
const organizationService = new OrganizationService();


// router.post('/setup', authenticate, async (req: Request, res: Response): Promise<void> => {
//   console.log('🔥 Setup endpoint hit!'); 
//   try {
//     const userId = (req as any).user.id;
//     const userRole = (req as any).user.role;

//     // Verify user is ORG_ADMIN
//     if (userRole !== UserRole.ORG_ADMIN) {
//       res.status(403).json({
//         success: false,
//         error: 'Only organization administrators can create organization profiles'
//       });
//       return;
//     }

//     // Check if user already has an organization
//     const existingOrg = await organizationService.getOrganizationByAdminId(userId);
//     if (existingOrg) {
//       res.status(409).json({
//         success: false,
//         error: 'Organization profile already exists for this admin'
//       });
//       return;
//     }

//     const { name, contactEmail, contactPhone, address, description, website } = req.body;

//     // Validate required fields
//     if (!name || !contactEmail) {
//       res.status(400).json({
//         success: false,
//         error: 'Organization name and contact email are required'
//       });
//       return;
//     }

//     // Create organization with admin reference
//     const organizationData = {
//       name,
//       contactEmail,
//       contactPhone,
//       address,
//       description,
//       website,
//       adminId: userId
//     };

//     const newOrganization = await organizationService.createOrganizationForAdmin(userId, organizationData);

//     // Mark user's organization setup as complete
//     await userService.updateUser(userId, { organizationSetupComplete: true });

//     res.status(201).json({
//       success: true,
//       data: {
//         organization: newOrganization,
//         message: 'Organization profile created successfully'
//       },
//       message: 'Organization setup completed'
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error instanceof Error ? error.message : 'Organization setup failed'
//     });
//   }
// });

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
    const { name, username, email, password, confirmPassword, educationLevel, termsAccepted } = registrationData;

    if (!name || !username || !email || !password || !confirmPassword || !educationLevel || !termsAccepted) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
      return;
    }

    if (!termsAccepted) {
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
      passwordHash: password, // Will be hashed in the service
      educationLevel: educationLevel,
      role: UserRole.INDIVIDUAL,
      isActive: true,
      emailVerified: false
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
          educationLevel: educationLevel,
          isOrgWard: false,
          emailVerified: user.emailVerified,
          createdAt: (user as any).createdAt || new Date()
        },
        verificationEmailSent: false
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

    // Extract only admin user fields for new two-phase approach
    const { 
      adminName, 
      adminUsername,
      adminEmail, 
      adminPassword, 
      confirmPassword, 
      termsAccepted 
    } = registrationData;

    if (!adminName || !adminUsername || !adminEmail || !adminPassword || !confirmPassword || !termsAccepted) {
      res.status(400).json({
        success: false,
        error: 'All admin fields are required'
      });
      return;
    }

    if (adminPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: 'Admin passwords do not match'
      });
      return;
    }

    if (!termsAccepted) {
      res.status(400).json({
        success: false,
        error: 'You must accept the terms and conditions'
      });
      return;
    }

    // Create admin user with ORG_ADMIN role (organization setup incomplete)
    const adminUserData = {
      name: adminName,
      username: adminUsername,
      email: adminEmail,
      passwordHash: adminPassword, // Will be hashed by UserService
      role: UserRole.ORG_ADMIN,
      organizationSetupComplete: false
    };

    const adminUser = await userService.createUser(adminUserData);

    res.status(201).json({
      success: true,
      data: {
        user: adminUser,
        setupRequired: true,
        message: 'Admin account created successfully. Please complete your organization setup after logging in.'
      },
      message: 'Organization admin registration successful'
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
      confirmPassword, 
      educationLevel,
      termsAccepted 
    } = registrationData;

    if (!token || !name || !username || !email || !password || !confirmPassword || !educationLevel || !termsAccepted) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
      return;
    }

    if (!termsAccepted) {
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

/**
 * @route POST /api/auth/temp-login
 * @desc Login with temporary code
 * @access Public
 */
router.post('/temp-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempCode, password } = req.body;

    console.log('🔐 Temp login attempt:', { tempCode });

    if (!tempCode || !password) {
      res.status(400).json({
        success: false,
        error: 'Temporary code and password are required'
      });
      return;
    }

    const authData = await userService.loginWithTempCode(tempCode, password);

    res.json({
      success: true,
      data: authData,
      message: 'Login successful. Please change your password.'
    });
  } catch (error) {
    console.error('❌ Temp login error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Temporary login failed'
    });
  }
});

/**
 * @route POST /api/auth/change-temp-password
 * @desc Change temporary password to permanent credentials
 * @access Private
 */
router.post('/change-temp-password', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { tempCode, newUsername, newPassword } = req.body;

    console.log('🔐 Change temp password request:', { userId: req.user.userId, tempCode });

    if (!tempCode || !newUsername || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Temporary code, new username, and new password are required'
      });
      return;
    }

    // Validate password strength (optional but recommended)
    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
      return;
    }

    const result = await userService.changeTempPassword(
      req.user.userId,
      tempCode,
      newUsername,
      newPassword
    );

    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('❌ Change temp password error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password'
    });
  }
});

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    console.log('📧 Password reset request for email:', email);

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required'
      });
      return;
    }

    const result = await passwordResetService.createResetToken(email);

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a password reset link will be sent.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    console.log('🔐 Password reset attempt with token');

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
      return;
    }

    const result = await passwordResetService.resetPassword(token, newPassword);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

/**
 * @route GET /api/auth/validate-reset-token/:token
 * @desc Validate password reset token
 * @access Public
 */
router.get('/validate-reset-token/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    console.log('🔍 Validating reset token');

    const validation = await passwordResetService.validateResetToken(token);

    res.json({
      success: true,
      data: {
        isValid: validation.isValid
      },
      message: validation.message
    });
  } catch (error) {
    console.error('❌ Validate token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate token'
    });
  }
});

export default router;
