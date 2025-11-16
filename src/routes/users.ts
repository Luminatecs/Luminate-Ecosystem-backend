import express from 'express';
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();
const userService = new UserService();
const authMiddleware = new AuthMiddleware();

// All routes require authentication
router.use(authMiddleware.authenticate);

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sortBy as string) || 'created_at';
    const sortOrder = (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC';

    console.log(`📄 Fetching users - Page: ${page}, Limit: ${limit}, SortBy: ${sortBy}, SortOrder: ${sortOrder}`);

    // Get users from database with pagination
    const result = await userService.getUsers({
      page,
      limit,
      orderBy: sortBy,
      orderDirection: sortOrder
    });

    console.log(`✅ Fetched ${result.data.length} users (Total: ${result.pagination.total})`);

    res.status(200).json({
      success: true,
      data: {
        users: result.data,
        pagination: result.pagination
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch users'
    });
  }
});

// GET /api/users/search
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log(`🔍 Searching users with query: "${query}"`);

    const users = await userService.searchUsers(query.trim());

    console.log(`✅ Found ${users.length} users matching query`);
    
    // Log first few results for debugging
    if (users.length > 0) {
      console.log('📋 Sample results:', users.slice(0, 3).map(u => ({ name: u.name, email: u.email })));
    }

    // Prevent caching of search results
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });
  } catch (error: any) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search users'
    });
  }
});

// GET /api/users/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implement get user by ID logic
    res.status(200).json({
      success: true,
      data: {
        user: {
          id,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    // TODO: Implement update user logic
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id,
          email,
          firstName,
          lastName,
          role: 'user',
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implement delete user logic
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

/**
 * PATCH /api/users/:id/role
 * Update user role (SUPER_ADMIN only)
 * @access Private (SUPER_ADMIN only)
 */
router.patch('/:id/role', authMiddleware.requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role is provided
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    // Validate role is a valid UserRole
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    console.log(`📝 Updating user ${id} role to ${role}`);

    // Update the user's role
    const updatedUser = await userService.updateUserRole(id, role);

    console.log(`✅ Successfully updated user ${id} role to ${role}`);

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        user: updatedUser
      }
    });
  } catch (error: any) {
    console.error('❌ Error updating user role:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user role'
    });
  }
});

export default router;
