import { db } from '../uitls/queryutils/database';
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
   * Map camelCase DTO properties to snake_case database columns
   */
  private mapToDatabase(data: any): any {
    const mapped: any = {};
    
    // Map known camelCase properties to snake_case
    if (data.contactEmail !== undefined) mapped.contact_email = data.contactEmail;
    if (data.contactPhone !== undefined) mapped.contact_phone = data.contactPhone;
    if (data.industryType !== undefined) mapped.industry_type = data.industryType;
    if (data.isActive !== undefined) mapped.is_active = data.isActive;
    if (data.adminId !== undefined) mapped.admin_id = data.adminId;
    if (data.createdAt !== undefined) mapped.created_at = data.createdAt;
    if (data.updatedAt !== undefined) mapped.updated_at = data.updatedAt;
    
    // Copy properties that don't need mapping
    if (data.id !== undefined) mapped.id = data.id;
    if (data.name !== undefined) mapped.name = data.name;
    if (data.description !== undefined) mapped.description = data.description;
    if (data.website !== undefined) mapped.website = data.website;
    if (data.address !== undefined) mapped.address = data.address;
    
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
      description: row.description,
      website: row.website,
      address: row.address
    };
    
    // Map snake_case to camelCase
    if (row.contact_email !== undefined) mapped.contactEmail = row.contact_email;
    if (row.contact_phone !== undefined) mapped.contactPhone = row.contact_phone;
    if (row.industry_type !== undefined) mapped.industryType = row.industry_type;
    if (row.is_active !== undefined) mapped.isActive = row.is_active;
    if (row.admin_id !== undefined) mapped.adminId = row.admin_id;
    if (row.created_at !== undefined) mapped.createdAt = row.created_at;
    if (row.updated_at !== undefined) mapped.updatedAt = row.updated_at;
    
    return mapped;
  }

  /**
   * Create a new organization
   */
  async create(organizationData: CreateOrganizationInput): Promise<Organization> {
    const dbData = this.mapToDatabase({
      ...organizationData,
      id: this.generateUUID(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await db.insert<any>(this.tableName, dbData);
    return this.mapFromDatabase(result);
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    const result = await db.findById<any>(this.tableName, id);
    return this.mapFromDatabase(result);
  }

  /**
   * Find organization by name
   */
  async findByName(name: string): Promise<Organization | null> {
    const result = await db.query<any>(
      'SELECT * FROM organizations WHERE name = $1',
      [name]
    );
    return this.mapFromDatabase(result.rows[0]);
  }

  /**
   * Find organization by contact email
   */
  async findByContactEmail(contactEmail: string): Promise<Organization | null> {
    const result = await db.query<any>(
      'SELECT * FROM organizations WHERE contact_email = $1',
      [contactEmail]
    );
    return this.mapFromDatabase(result.rows[0]);
  }

  /**
   * Find organization by admin user ID
   */
  async findByAdminId(adminId: string): Promise<Organization | null> {
    const result = await db.query<any>(
      'SELECT * FROM organizations WHERE admin_id = $1',
      [adminId]
    );
    return this.mapFromDatabase(result.rows[0]);
  }

  /**
   * Update organization by ID
   */
  async update(id: string, organizationData: UpdateOrganizationInput): Promise<Organization | null> {
    const dbData = this.mapToDatabase({
      ...organizationData,
      updatedAt: new Date()
    });

    const result = await db.update<any>(this.tableName, id, dbData);
    return this.mapFromDatabase(result);
  }

  /**
   * Delete organization by ID (soft delete)
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
   * Check if organization exists by contact email
   */
  async existsByContactEmail(contactEmail: string): Promise<boolean> {
    return await db.exists(this.tableName, { contact_email: contactEmail });
  }

  /**
   * Activate or deactivate an organization
   */
  async setActiveStatus(id: string, isActive: boolean): Promise<Organization | null> {
    return await this.update(id, { isActive });
  }

  /**
   * Set admin for organization
   */
  async setAdmin(id: string, adminId: string): Promise<Organization | null> {
    return await this.update(id, { adminId });
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
      const searchCondition = ` WHERE (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR contact_email ILIKE $${paramIndex})`;
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
   * Find all active organizations
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
      db.query<any>(baseQuery, [limit, offset]),
      db.query<{ count: string }>(countQuery, [])
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
   * Get organization stats
   */
  async getStats(id: string): Promise<any> {
    const stats = await db.query(`
      SELECT 
        COUNT(u.id) as total_users,
        COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN u.role = 'ORG_WARD' THEN 1 END) as ward_users,
        COUNT(CASE WHEN u.role = 'ORG_ADMIN' THEN 1 END) as admin_users
      FROM users u 
      WHERE u.organization_id = $1
    `, [id]);

    return {
      totalUsers: parseInt(stats.rows[0]?.total_users || '0'),
      activeUsers: parseInt(stats.rows[0]?.active_users || '0'),
      wardUsers: parseInt(stats.rows[0]?.ward_users || '0'),
      adminUsers: parseInt(stats.rows[0]?.admin_users || '0')
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
