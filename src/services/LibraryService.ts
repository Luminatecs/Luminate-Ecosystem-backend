import { Pool } from 'pg';
import { ISchool } from '../models/Library/interfaces/ISchool';
import redisManager from '../config/redis';

export class LibraryService {
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
  async searchSchools(searchTerm: string, tableName: string, userColumnHints: string[]): Promise<ISchool[]> {
  try {
    // Basic validation for table name to prevent SQL injection on identifier names.
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Invalid table name provided. Table name can only contain letters, numbers, and underscores.');
    }

<<<<<<< HEAD
    // Validate userColumnHints input
    if (!Array.isArray(userColumnHints) || userColumnHints.length === 0) {
      throw new Error('No column hints provided for search. Please provide at least one column hint.');
    }

    // 1. Fetch actual column names for the specified table from the database schema
    const schemaQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = current_schema()
    `;
    const schemaResult = await this.pool.query(schemaQuery, [tableName]);
    const actualColumnNames = schemaResult.rows.map(row => row.column_name);

    if (actualColumnNames.length === 0) {
      throw new Error(`Table "${tableName}" not found or has no accessible columns in the current schema.`);
    }

    const columnsToSearch = new Set(); // Use a Set to store unique actual column names to search in

    // 2. Map user-provided column hints to actual database column names using partial matching
    for (const userHint of userColumnHints) {
      // Validate userHint for safe SQL identifier characters
      if (!/^[a-zA-Z0-9_]+$/.test(userHint)) {
        throw new Error(`Invalid column hint provided: "${userHint}". Hints can only contain letters, numbers, and underscores.`);
=======
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
>>>>>>> 4837bfaa2085caae01c40083a41c757ead7f6a6a
      }

      let hintMatched = false;
      // Iterate through actual column names to find matches for the user's hint
      for (const actualCol of actualColumnNames) {
        if (actualCol.toLowerCase().includes(userHint.toLowerCase())) {
          columnsToSearch.add(actualCol);
          hintMatched = true;
        }
      }

<<<<<<< HEAD
      // If a user provided a hint and it didn't match any actual column, throw an error
      if (!hintMatched) {
        // This is important to prevent silent failures if a user misspells a hint entirely
        throw new Error(`The column hint "${userHint}" did not match any actual column in table "${tableName}".`);
      }
=======
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
>>>>>>> 4837bfaa2085caae01c40083a41c757ead7f6a6a
    }

    // Ensure after mapping, we still have actual columns to search in
    if (columnsToSearch.size === 0) {
      throw new Error(`No database columns found that match your provided search column hints: ${userColumnHints.join(', ')}.`);
    }

    const finalColumnsToQuery = Array.from(columnsToSearch); // Convert Set back to Array for processing
    const whereClauses = [];
    const queryValues = [];
    let paramCounter = 1;

    // 3. Build the WHERE clause for each identified column using ILIKE and parameterized values
    for (const col of finalColumnsToQuery) {
      whereClauses.push(`"${col}" ILIKE $${paramCounter}`);
      queryValues.push(`%${searchTerm}%`); // Wrap search term with '%' for case-insensitive partial match
      paramCounter++;
    }

    // Join the WHERE clauses with OR to search across all specified columns
    const queryText = `SELECT * FROM "${tableName}" WHERE ${whereClauses.join(' OR ')}`;

    console.log(`Executing query: "${queryText}" with terms: ${JSON.stringify(queryValues)}`);

    // 4. Execute the query using the pool
    const result = await this.pool.query(queryText, queryValues);

    return result.rows; // Return the fetched rows
  } catch (error) {
    console.error('Database search error:', error.message);
    throw error; // Re-throw to be caught by the API endpoint
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
