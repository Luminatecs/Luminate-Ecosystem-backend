import { Pool } from 'pg';
import redisManager from '../config/redis';

export interface IResource {
  id: string;
  title: string;
  description: string;
  full_description: string;
  category: string;
  type: string;
  resource_type: 'students' | 'parents' | 'counselors';
  rating: number;
  link?: string;
  featured: boolean;
  image?: string;
  features: string[];
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  free: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
}

export interface CreateResourceInput {
  title: string;
  description: string;
  full_description: string;
  category: string;
  type: string;
  resource_type: 'students' | 'parents' | 'counselors';
  rating?: number;
  link?: string;
  featured?: boolean;
  image?: string;
  features: string[];
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  free?: boolean;
  created_by?: string;
}

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
  async getResourcesByType(resourceType: 'students' | 'parents' | 'counselors'): Promise<IResource[]> {
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
