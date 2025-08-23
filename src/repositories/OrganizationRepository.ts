import { db } from '../services/database';
import { 
  Organization, 
  CreateOrganizationInput, 
  UpdateOrganizationInput
} from '../models/Auth/interfaces';
import { 
  QueryOptions, 
  PaginatedResponse 
} from '../types/database';

export class OrganizationRepository {
  private tableName = 'organizations';

  /**
   * Create a new organization
   */
  async create(orgData: CreateOrganizationInput): Promise<Organization> {
    const orgWithTimestamps = {
      ...orgData,
      id: this.generateUUID(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    return await db.insert<Organization>(this.tableName, orgWithTimestamps);
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    return await db.findById<Organization>(this.tableName, id);
  }

  /**
   * Find organization by name
   */
  async findByName(name: string): Promise<Organization | null> {
    const result = await db.query<Organization>(
      'SELECT * FROM organizations WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all organizations with pagination and filtering
   */
  async findMany(options: QueryOptions = {}): Promise<PaginatedResponse<Organization>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDirection = 'DESC',
      search
    } = options;

    const offset = (page - 1) * limit;
    let baseQuery = 'SELECT * FROM organizations';
    let countQuery = 'SELECT COUNT(*) as count FROM organizations';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add search functionality
    if (search) {
      const searchCondition = ` WHERE (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
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
      db.query<Organization>(baseQuery, queryParams),
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
   * Find active organizations only
   */
  async findActive(options: QueryOptions = {}): Promise<PaginatedResponse<Organization>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const baseQuery = `
      SELECT * FROM organizations 
      WHERE is_active = true 
      ORDER BY ${orderBy} ${orderDirection} 
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) as count FROM organizations WHERE is_active = true';

    const [dataResult, countResult] = await Promise.all([
      db.query<Organization>(baseQuery, [limit, offset]),
      db.query<{ count: string }>(countQuery, [])
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
   * Update organization by ID
   */
  async update(id: string, orgData: UpdateOrganizationInput): Promise<Organization | null> {
    const updateData = {
      ...orgData,
      updated_at: new Date()
    };

    return await db.update<Organization>(this.tableName, id, updateData);
  }

  /**
   * Delete organization by ID
   */
  async delete(id: string): Promise<boolean> {
    return await db.delete(this.tableName, id);
  }

  /**
   * Check if organization exists by name
   */
  async existsByName(name: string): Promise<boolean> {
    return await db.exists(this.tableName, { name });
  }

  /**
   * Activate or deactivate an organization
   */
  async setActiveStatus(id: string, isActive: boolean): Promise<Organization | null> {
    return await this.update(id, { is_active: isActive });
  }

  /**
   * Get organization statistics
   */
  async getStats(id: string): Promise<{
    organization: Organization | null;
    userCount: number;
    activeUserCount: number;
  }> {
    const organization = await this.findById(id);
    
    if (!organization) {
      return {
        organization: null,
        userCount: 0,
        activeUserCount: 0
      };
    }

    const [userCountResult, activeUserCountResult] = await Promise.all([
      db.query<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE organization_id = $1', [id]),
      db.query<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE organization_id = $1 AND is_active = true', [id])
    ]);

    return {
      organization,
      userCount: parseInt(userCountResult.rows[0]?.count || '0'),
      activeUserCount: parseInt(activeUserCountResult.rows[0]?.count || '0')
    };
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
