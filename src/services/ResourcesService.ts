import { Pool } from 'pg';
import redisManager from '../config/redis';
import { IResource, CreateResourceInput, UpdateResourceInput, ResourceType } from '../models/Resource';

export class ResourcesService {
  private pool: Pool;

  constructor() {
    // Initialize PostgreSQL pool using individual config variables
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      database: process.env.DB_NAME || 'luminateEcosystem',
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });

    // Initialize Redis connection (non-blocking) - COMMENTED OUT FOR NOW
    // this.initializeRedis();
  }

  // COMMENTED OUT FOR NOW - Redis connection initialization
  // private async initializeRedis(): Promise<void> {
  //   try {
  //     await redisManager.connect();
  //     console.log('✅ ResourcesService: Redis connection initialized');
  //   } catch (error) {
  //     console.warn('⚠️ ResourcesService: Redis unavailable, continuing without cache:', (error as Error).message);
  //   }
  // }

  /**
   * Get all resources with Redis caching
   */
  async getAllResources(): Promise<IResource[]> {
    const redisKey = 'resources:all';

    try {
      // Try cache first (but don't fail if Redis is unavailable)
      try {
        const cachedData = await redisManager.get(redisKey);
        if (cachedData) {
          console.log('📋 Serving resources from Redis cache');
          return JSON.parse(cachedData);
        }
      } catch (redisError) {
        console.warn('⚠️ Redis cache miss, continuing with database query');
      }

      // Query database
      const result = await this.pool.query(`
        SELECT 
          id,
          title,
          description,
          full_description,
          category,
          type,
          resource_type,
          rating,
          link,
          featured,
          image,
          features,
          duration,
          difficulty,
          tags,
          free,
          created_at,
          updated_at,
          created_by,
          is_active
        FROM resources 
        WHERE is_active = true
        ORDER BY featured DESC, created_at DESC
      `);

      const resources = result.rows;
      console.log(`📋 Retrieved ${resources.length} resources from database`);

      // Cache for 1 hour (but don't fail if Redis is unavailable)
      try {
        await redisManager.setEx(redisKey, 3600, JSON.stringify(resources));
        console.log('💾 Resources cached in Redis');
      } catch (redisError) {
        console.warn('⚠️ Failed to cache resources in Redis, continuing normally');
      }

      return resources;
    } catch (error) {
      console.error('❌ Error fetching resources:', error);
      throw new Error('Failed to fetch resources');
    }
  }

  /**
   * Get resources by type with Redis caching
   */
  async getResourcesByType(resourceType: ResourceType): Promise<IResource[]> {
    const redisKey = `resources:type:${resourceType}`;

    try {
      // Try cache first
      try {
        const cachedData = await redisManager.get(redisKey);
        if (cachedData) {
          console.log(`📋 Serving ${resourceType} resources from Redis cache`);
          return JSON.parse(cachedData);
        }
      } catch (redisError) {
        console.warn('⚠️ Redis cache miss, continuing with database query');
      }

      // Query database
      const result = await this.pool.query(`
        SELECT 
          id,
          title,
          description,
          full_description,
          category,
          type,
          resource_type,
          rating,
          link,
          featured,
          image,
          features,
          duration,
          difficulty,
          tags,
          free,
          created_at,
          updated_at,
          created_by,
          is_active
        FROM resources 
        WHERE resource_type = $1 AND is_active = true
        ORDER BY featured DESC, created_at DESC
      `, [resourceType]);

      const resources = result.rows;
      console.log(`📋 Retrieved ${resources.length} ${resourceType} resources from database`);

      // Cache for 1 hour
      try {
        await redisManager.setEx(redisKey, 3600, JSON.stringify(resources));
        console.log(`💾 ${resourceType} resources cached in Redis`);
      } catch (redisError) {
        console.warn('⚠️ Failed to cache resources in Redis, continuing normally');
      }

      return resources;
    } catch (error) {
      console.error(`❌ Error fetching ${resourceType} resources:`, error);
      throw new Error(`Failed to fetch ${resourceType} resources`);
    }
  }

  /**
   * Search resources with Redis caching
   */
  async searchResources(searchTerm: string): Promise<IResource[]> {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    const redisKey = `resources:search:${normalizedSearchTerm}`;

    try {
      // Try cache first
      try {
        const cachedData = await redisManager.get(redisKey);
        if (cachedData) {
          console.log(`📋 Serving search results for "${searchTerm}" from Redis cache`);
          return JSON.parse(cachedData);
        }
      } catch (redisError) {
        console.warn('⚠️ Redis cache miss, continuing with database query');
      }

      // Query database with text search
      const result = await this.pool.query(`
        SELECT 
          id,
          title,
          description,
          full_description,
          category,
          type,
          resource_type,
          rating,
          link,
          featured,
          image,
          features,
          duration,
          difficulty,
          tags,
          free,
          created_at,
          updated_at,
          created_by,
          is_active
        FROM resources 
        WHERE is_active = true
          AND (
            LOWER(title) LIKE $1 
            OR LOWER(description) LIKE $1 
            OR LOWER(full_description) LIKE $1
            OR LOWER(category) LIKE $1
            OR LOWER(type) LIKE $1
          )
        ORDER BY featured DESC, created_at DESC
      `, [`%${normalizedSearchTerm}%`]);

      const resources = result.rows;
      console.log(`📋 Found ${resources.length} resources matching "${searchTerm}"`);

      // Cache for 30 minutes
      try {
        await redisManager.setEx(redisKey, 1800, JSON.stringify(resources));
        console.log(`💾 Search results for "${searchTerm}" cached in Redis`);
      } catch (redisError) {
        console.warn('⚠️ Failed to cache search results in Redis, continuing normally');
      }

      return resources;
    } catch (error) {
      console.error(`❌ Error searching resources for "${searchTerm}":`, error);
      throw new Error('Failed to search resources');
    }
  }

  /**
   * Create a new resource
   */
  async createResource(resourceData: CreateResourceInput): Promise<IResource> {
    try {
      const result = await this.pool.query(`
        INSERT INTO resources (
          title, description, full_description, category, type, resource_type,
          rating, link, featured, image, features, duration, difficulty, tags, free, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING 
          id, title, description, full_description, category, type, resource_type,
          rating, link, featured, image, features, duration, difficulty, tags, free,
          created_at, updated_at, created_by, is_active
      `, [
        resourceData.title,
        resourceData.description,
        resourceData.full_description,
        resourceData.category,
        resourceData.type,
        resourceData.resource_type,
        resourceData.rating || 0,
        resourceData.link,
        resourceData.featured || false,
        resourceData.image,
        JSON.stringify(resourceData.features),
        resourceData.duration,
        resourceData.difficulty,
        JSON.stringify(resourceData.tags || []),
        resourceData.free !== false,
        resourceData.created_by
      ]);

      const newResource = result.rows[0];
      console.log(`✅ Created new resource: ${newResource.title}`);

      // Clear related caches
      await this.clearResourceCaches();

      return newResource;
    } catch (error) {
      console.error('❌ Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id: string): Promise<IResource | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          id, title, description, full_description, category, type, resource_type,
          rating, link, featured, image, features, duration, difficulty, tags, free,
          created_at, updated_at, created_by, is_active
        FROM resources 
        WHERE id = $1 AND is_active = true
      `, [id]);

      return result.rows[0] || null;
    } catch (error) {
      console.error(`❌ Error fetching resource ${id}:`, error);
      throw new Error('Failed to fetch resource');
    }
  }

  /**
   * Update a resource by ID
   */
  async updateResource(id: string, resourceData: Partial<CreateResourceInput>): Promise<IResource | null> {
    try {
      // First check if resource exists
      const existing = await this.getResourceById(id);
      if (!existing) {
        throw new Error('Resource not found');
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (resourceData.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(resourceData.title);
      }
      if (resourceData.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(resourceData.description);
      }
      if (resourceData.full_description !== undefined) {
        updates.push(`full_description = $${paramIndex++}`);
        values.push(resourceData.full_description);
      }
      if (resourceData.category !== undefined) {
        updates.push(`category = $${paramIndex++}`);
        values.push(resourceData.category);
      }
      if (resourceData.type !== undefined) {
        updates.push(`type = $${paramIndex++}`);
        values.push(resourceData.type);
      }
      if (resourceData.resource_type !== undefined) {
        updates.push(`resource_type = $${paramIndex++}`);
        values.push(resourceData.resource_type);
      }
      if (resourceData.rating !== undefined) {
        updates.push(`rating = $${paramIndex++}`);
        values.push(resourceData.rating);
      }
      if (resourceData.link !== undefined) {
        updates.push(`link = $${paramIndex++}`);
        values.push(resourceData.link);
      }
      if (resourceData.featured !== undefined) {
        updates.push(`featured = $${paramIndex++}`);
        values.push(resourceData.featured);
      }
      if (resourceData.image !== undefined) {
        updates.push(`image = $${paramIndex++}`);
        values.push(resourceData.image);
      }
      if (resourceData.features !== undefined) {
        updates.push(`features = $${paramIndex++}`);
        values.push(JSON.stringify(resourceData.features));
      }
      if (resourceData.duration !== undefined) {
        updates.push(`duration = $${paramIndex++}`);
        values.push(resourceData.duration);
      }
      if (resourceData.difficulty !== undefined) {
        updates.push(`difficulty = $${paramIndex++}`);
        values.push(resourceData.difficulty);
      }
      if (resourceData.tags !== undefined) {
        updates.push(`tags = $${paramIndex++}`);
        values.push(JSON.stringify(resourceData.tags));
      }
      if (resourceData.free !== undefined) {
        updates.push(`free = $${paramIndex++}`);
        values.push(resourceData.free);
      }

      // Always update updated_at
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Add ID as last parameter
      values.push(id);

      if (updates.length === 1) { // Only updated_at
        return existing; // Nothing to update
      }

      const result = await this.pool.query(`
        UPDATE resources 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex} AND is_active = true
        RETURNING 
          id, title, description, full_description, category, type, resource_type,
          rating, link, featured, image, features, duration, difficulty, tags, free,
          created_at, updated_at, created_by, is_active
      `, values);

      const updatedResource = result.rows[0];
      console.log(`✅ Updated resource: ${updatedResource.title}`);

      // Clear related caches
      await this.clearResourceCaches();

      return updatedResource;
    } catch (error) {
      console.error(`❌ Error updating resource ${id}:`, error);
      throw new Error('Failed to update resource');
    }
  }

  /**
   * Delete a resource by ID (soft delete)
   */
  async deleteResource(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        UPDATE resources 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = true
        RETURNING id
      `, [id]);

      if (result.rows.length === 0) {
        throw new Error('Resource not found');
      }

      console.log(`✅ Deleted resource: ${id}`);

      // Clear related caches
      await this.clearResourceCaches();

      return true;
    } catch (error) {
      console.error(`❌ Error deleting resource ${id}:`, error);
      throw new Error('Failed to delete resource');
    }
  }

  /**
   * Clear all resource-related caches
   */
  private async clearResourceCaches(): Promise<void> {
    try {
      const keys = [
        'resources:all',
        'resources:type:students',
        'resources:type:parents',
        'resources:type:counselors'
      ];

      for (const key of keys) {
        try {
          await redisManager.del(key);
        } catch (redisError) {
          console.warn(`⚠️ Failed to clear cache key ${key}, continuing normally`);
        }
      }

      // Clear search caches (simplified approach)
      try {
        // Just clear all search caches at once - simpler approach
        for (let i = 0; i < 10; i++) {
          await redisManager.del(`resources:search:${i}`);
        }
      } catch (redisError) {
        console.warn('⚠️ Failed to clear search caches, continuing normally');
      }

      console.log('💾 Resource caches cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear resource caches, continuing normally');
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export singleton instance
const resourcesService = new ResourcesService();
export default resourcesService;
