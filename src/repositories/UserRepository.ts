import { QueryResultRow } from 'pg';
import { db } from '../uitls/queryutils/database';
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
   * Map camelCase DTO properties to snake_case database columns
   */
  private mapToDatabase(data: any): any {
    const mapped: any = {};
    
    // Map known camelCase properties to snake_case
    if (data.firstName !== undefined) mapped.first_name = data.firstName;
    if (data.lastName !== undefined) mapped.last_name = data.lastName;
    if (data.passwordHash !== undefined) mapped.password_hash = data.passwordHash;
    if (data.educationLevel !== undefined) mapped.education_level = data.educationLevel;
    if (data.organizationId !== undefined) mapped.organization_id = data.organizationId;
    if (data.isOrgWard !== undefined) mapped.is_org_ward = data.isOrgWard;
    if (data.isActive !== undefined) mapped.is_active = data.isActive;
    if (data.emailVerified !== undefined) mapped.email_verified = data.emailVerified;
    if (data.emailVerifiedAt !== undefined) mapped.email_verified_at = data.emailVerifiedAt;
    if (data.lastLoginAt !== undefined) mapped.last_login_at = data.lastLoginAt;
    if (data.organizationSetupComplete !== undefined) mapped.organization_setup_complete = data.organizationSetupComplete;
    if (data.createdAt !== undefined) mapped.created_at = data.createdAt;
    if (data.updatedAt !== undefined) mapped.updated_at = data.updatedAt;
    
    // Map guardian/ward fields
    if (data.guardianName !== undefined) mapped.guardian_name = data.guardianName;
    if (data.guardianEmail !== undefined) mapped.guardian_email = data.guardianEmail;
    if (data.wardName !== undefined) mapped.ward_name = data.wardName;
    
    // Copy properties that don't need mapping
    if (data.id !== undefined) mapped.id = data.id;
    if (data.name !== undefined) mapped.name = data.name;
    if (data.username !== undefined) mapped.username = data.username;
    if (data.email !== undefined) mapped.email = data.email;
    if (data.role !== undefined) mapped.role = data.role;
    
    return mapped;
  }

  /**
   * Map snake_case database columns to camelCase DTO properties
   */
  private mapFromDatabase(row: any): any {
    if (!row) return null;
    
    const mapped: any = {
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email,
      role: row.role
    };
    
    // Map snake_case to camelCase
    if (row.first_name !== undefined) mapped.firstName = row.first_name;
    if (row.last_name !== undefined) mapped.lastName = row.last_name;
    if (row.password_hash !== undefined) mapped.passwordHash = row.password_hash;
    if (row.education_level !== undefined) mapped.educationLevel = row.education_level;
    if (row.organization_id !== undefined) mapped.organizationId = row.organization_id;
    if (row.is_org_ward !== undefined) mapped.isOrgWard = row.is_org_ward;
    if (row.is_active !== undefined) mapped.isActive = row.is_active;
    if (row.email_verified !== undefined) mapped.emailVerified = row.email_verified;
    if (row.email_verified_at !== undefined) mapped.emailVerifiedAt = row.email_verified_at;
    if (row.last_login_at !== undefined) mapped.lastLoginAt = row.last_login_at;
    if (row.organization_setup_complete !== undefined) mapped.organizationSetupComplete = row.organization_setup_complete;
    if (row.created_at !== undefined) mapped.createdAt = row.created_at;
    if (row.updated_at !== undefined) mapped.updatedAt = row.updated_at;
    
    // Map guardian/ward fields
    if (row.guardian_name !== undefined) mapped.guardianName = row.guardian_name;
    if (row.guardian_email !== undefined) mapped.guardianEmail = row.guardian_email;
    if (row.ward_name !== undefined) mapped.wardName = row.ward_name;
    
    return mapped;
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserInput): Promise<User> {
    const dbData = this.mapToDatabase({
      ...userData,
      id: this.generateUUID(),
      role: userData.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await db.insert<any>(this.tableName, dbData);
    return this.mapFromDatabase(result);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await db.findById<any>(this.tableName, id);
    return this.mapFromDatabase(result);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query<any>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return this.mapFromDatabase(result.rows[0]);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await db.query<any>(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return this.mapFromDatabase(result.rows[0]);
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
    let baseQuery = 'SELECT id, email, name, username, role, is_active, last_login_at, organization_id, created_at, updated_at FROM users';
    let countQuery = 'SELECT COUNT(*) as count FROM users';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add search functionality
    if (search) {
      const searchCondition = ` WHERE (name ILIKE $${paramIndex} OR username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
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
      db.query<any>(baseQuery, queryParams),
      db.query<{ count: string }>(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows.map(row => this.mapFromDatabase(row)),
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
    const dbData = this.mapToDatabase({
      ...userData,
      updatedAt: new Date()
    });

    const result = await db.transaction(async (client) => {
      const columns = Object.keys(dbData);
      const values = Object.values(dbData);
      const setClause = columns.map((key, i) => `${key} = $${i + 2}`).join(', ');
      
      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`;
      const params = [id, ...values];
      
      const updateResult = await client.query(query, params);
      return updateResult.rows[0];
    });

    return this.mapFromDatabase(result);
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
    await db.update(this.tableName, id, this.mapToDatabase({ 
      lastLoginAt: new Date(),
      updatedAt: new Date()
    }));
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
      SELECT id, email, name, username, role, is_active, last_login_at, organization_id, created_at, updated_at 
      FROM users 
      WHERE organization_id = $1 
      ORDER BY ${orderBy} ${orderDirection} 
      LIMIT $2 OFFSET $3
    `;

    const countQuery = 'SELECT COUNT(*) as count FROM users WHERE organization_id = $1';

    const [dataResult, countResult] = await Promise.all([
      db.query<any>(baseQuery, [organizationId, limit, offset]),
      db.query<{ count: string }>(countQuery, [organizationId])
    ]);

    const total = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows.map(row => this.mapFromDatabase(row)),
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
    return await this.update(id, { isActive });
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

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await db.query(query, [newRole, userId]);
  }

  /**
   * Search users by name, email, username, or role
   * Case-insensitive search across all fields
   */
  async searchUsers(searchQuery: string): Promise<User[]> {
    const searchPattern = `%${searchQuery}%`;
    
    const query = `
      SELECT 
        id, 
        name, 
        email, 
        username, 
        role, 
        education_level as "educationLevel",
        organization_id as "organizationId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        password_hash as "passwordHash"
      FROM ${this.tableName}
      WHERE (
        name ILIKE $1 
        OR email ILIKE $1 
        OR username ILIKE $1 
        OR CAST(role AS TEXT) ILIKE $1
      )
      ORDER BY 
        CASE 
          WHEN name ILIKE $1 THEN 1
          WHEN email ILIKE $1 THEN 2
          WHEN username ILIKE $1 THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT 100
    `;
    
    console.log('🔍 Executing search query with pattern:', searchPattern);
    
    const result = await db.query(query, [searchPattern]);
    
    console.log('✅ Search query returned', result.rows.length, 'users');
    
    return result.rows;
  }
}
