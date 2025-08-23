import { QueryResultRow } from 'pg';
import { db } from '../services/database';
import { 
  User, 
  CreateUserInput, 
  UpdateUserInput,
  UserRole 
} from '../models/Auth/interfaces';
import { 
  QueryOptions, 
  PaginatedResponse
} from '../types/database';

export class UserRepository {
  private tableName = 'users';

  /**
   * Create a new user
   */
  async create(userData: CreateUserInput): Promise<User> {
    const userWithTimestamps = {
      ...userData,
      id: this.generateUUID(),
      role: userData.role,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    return await db.insert<User>(this.tableName, userWithTimestamps);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await db.findById<User>(this.tableName, id);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await db.query<User>(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all users with pagination and filtering
   */
  async findMany(options: QueryOptions = {}): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDirection = 'DESC',
      search
    } = options;

    const offset = (page - 1) * limit;
    let baseQuery = 'SELECT id, email, first_name, last_name, role, is_active, last_login_at, organization_id, created_at, updated_at FROM users';
    let countQuery = 'SELECT COUNT(*) as count FROM users';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add search functionality
    if (search) {
      const searchCondition = ` WHERE (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      baseQuery += searchCondition;
      countQuery += searchCondition;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add ordering
    baseQuery += ` ORDER BY ${orderBy} ${orderDirection}`;
    
    // Add pagination
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      db.query<Omit<User, 'password_hash'>>(baseQuery, queryParams),
      db.query<{ count: string }>(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Update user by ID
   */
  async update(id: string, userData: UpdateUserInput): Promise<User | null> {
    const updateData = {
      ...userData,
      updated_at: new Date()
    };

    return await db.update<User>(this.tableName, id, updateData);
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<boolean> {
    return await db.delete(this.tableName, id);
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    return await db.exists(this.tableName, { email });
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: string): Promise<void> {
    await db.update(this.tableName, id, { 
      last_login_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Find users by organization ID
   */
  async findByOrganization(organizationId: string, options: QueryOptions = {}): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const baseQuery = `
      SELECT id, email, first_name, last_name, role, is_active, last_login_at, organization_id, created_at, updated_at 
      FROM users 
      WHERE organization_id = $1 
      ORDER BY ${orderBy} ${orderDirection} 
      LIMIT $2 OFFSET $3
    `;

    const countQuery = 'SELECT COUNT(*) as count FROM users WHERE organization_id = $1';

    const [dataResult, countResult] = await Promise.all([
      db.query<Omit<User, 'password_hash'>>(baseQuery, [organizationId, limit, offset]),
      db.query<{ count: string }>(countQuery, [organizationId])
    ]);

    const total = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Activate or deactivate a user
   */
  async setActiveStatus(id: string, isActive: boolean): Promise<User | null> {
    return await this.update(id, { is_active: isActive });
  }

  /**
   * Execute a custom query
   */
  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    return await db.query(sql, params);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
