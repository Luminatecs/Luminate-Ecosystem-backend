import { Pool } from 'pg';
import { ISchool } from '../models/Library/interfaces/ISchool';
import redisManager from '../config/redis';

export class LibraryService {
  private pool: Pool;

  constructor() {
    // Initialize PostgreSQL pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });

    // Initialize Redis connection (non-blocking)
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      await redisManager.connect();
      console.log('✅ LibraryService: Redis connection initialized');
    } catch (error) {
      console.warn('⚠️ LibraryService: Redis unavailable, continuing without cache:', (error as Error).message);
    }
  }

  /**
   * Get all school data with Redis caching
   */
  async getAllSchoolData(): Promise<ISchool[]> {
    const redisKey = 'school_data:all';

    try {
      // Try cache first (but don't fail if Redis is unavailable)
      try {
        const cachedData = await redisManager.get(redisKey);
        if (cachedData) {
          console.log('📋 Serving school data from Redis cache');
          return JSON.parse(cachedData);
        }
      } catch (redisError) {
        console.warn('⚠️ Redis cache miss, continuing with database query');
      }

      const result = await this.pool.query('SELECT * FROM school_data ORDER BY "SCHOOL" ASC');
      const allSchools: ISchool[] = result.rows;

      // Try to cache the data (but don't fail if Redis is unavailable)
      try {
        await redisManager.setEx(redisKey, 3600, JSON.stringify(allSchools));
        console.log('💾 Cached school data in Redis');
      } catch (redisError) {
        console.warn('⚠️ Failed to cache school data, continuing without cache');
      }

      return allSchools;
    } catch (err) {
      console.error('❌ Error fetching school data:', err);
      throw new Error('Failed to fetch school data');
    }
  }

  /**
   * Add new school data
   */
  async addSchoolData(schoolData: Omit<ISchool, '"S.N"' | 'created_at' | 'updated_at'>): Promise<ISchool> {
    try {
      const result = await this.pool.query(`
        INSERT INTO school_data(
          "REGION", "DISTRICT", "SCHOOL", "CATEGORIES", "LOCATION", 
          "GENDER", "RESIDENCY", "EMAIL ADDRESS", "Categories2", 
          "electives", "core"
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *
      `, [
        schoolData.REGION,
        schoolData.DISTRICT, 
        schoolData.SCHOOL,
        schoolData.CATEGORIES,
        schoolData.LOCATION,
        schoolData.GENDER,
        schoolData.RESIDENCY,
        schoolData["EMAIL ADDRESS"],
        schoolData.Categories2,
        schoolData.electives,
        schoolData.core
      ]);

      // Invalidate the cache when new data is added (but don't fail if Redis is unavailable)
      try {
        await redisManager.del('school_data:all');
        console.log('🗑️ Invalidated school data cache');
      } catch (redisError) {
        console.warn('⚠️ Failed to invalidate cache, continuing without cache invalidation');
      }

      return result.rows[0];
    } catch (err) {
      console.error('❌ Error adding school data:', err);
      throw new Error('Failed to add school data');
    }
  }

  /**
   * Search schools by name
   */
  async searchSchools(searchTerm: string): Promise<ISchool[]> {
    const redisKey = `school_search:${searchTerm.toLowerCase()}`;

    try {
      // Try cache first (but don't fail if Redis is unavailable)
      try {
        const cachedData = await redisManager.get(redisKey);
        if (cachedData) {
          console.log('🔍 Serving search results from Redis cache');
          return JSON.parse(cachedData);
        }
      } catch (redisError) {
        console.warn('⚠️ Redis cache miss, continuing with database query');
      }

      // Search in database
      const result = await this.pool.query(`
        SELECT * FROM school_data 
        WHERE "SCHOOL" ILIKE $1 
        OR "DISTRICT" ILIKE $1 
        OR "REGION" ILIKE $1 
        ORDER BY "SCHOOL" ASC
      `, [`%${searchTerm}%`]);
      const searchResults: ISchool[] = result.rows;

      // Try to cache search results for 30 minutes (but don't fail if Redis is unavailable)
      try {
        await redisManager.setEx(redisKey, 1800, JSON.stringify(searchResults));
        console.log('💾 Cached search results in Redis');
      } catch (redisError) {
        console.warn('⚠️ Failed to cache search results, continuing without cache');
      }

      return searchResults;
    } catch (err) {
      console.error('❌ Error searching schools:', err);
      throw new Error('Failed to search schools');
    }
  }


  /**
   * Close connections for graceful shutdown
   */
  async closeConnections(): Promise<void> {
    try {
      await redisManager.quit();
      await this.pool.end();
      console.log('🔒 LibraryService connections closed');
    } catch (err) {
      console.error('❌ Error closing LibraryService connections:', err);
    }
  }
}
