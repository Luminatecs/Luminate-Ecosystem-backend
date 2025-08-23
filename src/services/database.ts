import { Pool, PoolClient, QueryResult, QueryConfig, QueryResultRow } from 'pg';
import { pool } from '../config/database';

export interface DatabaseService {
  query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  getClient(): Promise<PoolClient>;
  transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
}

class PostgreSQLService implements DatabaseService {
  private pool: Pool;

  constructor(connectionPool: Pool) {
    this.pool = connectionPool;
  }

  /**
   * Execute a query using the connection pool
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    const res = await this.pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    console.log('📊 Query executed', {
      text,
      duration: `${duration}ms`,
      rows: res.rowCount
    });
    
    return res;
  }

  /**
   * Get a client from the pool for complex operations
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute multiple queries within a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a prepared statement
   */
  async executeQuery<T extends QueryResultRow = any>(queryConfig: QueryConfig): Promise<QueryResult<T>> {
    const start = Date.now();
    const res = await this.pool.query<T>(queryConfig);
    const duration = Date.now() - start;
    
    console.log('📊 Prepared query executed', {
      name: queryConfig.name,
      duration: `${duration}ms`,
      rows: res.rowCount
    });
    
    return res;
  }

  /**
   * Check if a record exists
   */
  async exists(table: string, conditions: Record<string, any>): Promise<boolean> {
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');
    
    const query = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${whereClause})`;
    const values = Object.values(conditions);
    
    const result = await this.query<{ exists: boolean }>(query, values);
    return result.rows[0]?.exists || false;
  }

  /**
   * Get a single record by ID
   */
  async findById<T extends QueryResultRow = any>(table: string, id: string | number, idColumn: string = 'id'): Promise<T | null> {
    const query = `SELECT * FROM ${table} WHERE ${idColumn} = $1`;
    const result = await this.query<T>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get multiple records with optional conditions
   */
  async findMany<T extends QueryResultRow = any>(
    table: string, 
    conditions?: Record<string, any>,
    orderBy?: string,
    limit?: number,
    offset?: number
  ): Promise<T[]> {
    let query = `SELECT * FROM ${table}`;
    const values: any[] = [];
    let paramIndex = 1;

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key) => `${key} = $${paramIndex++}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(offset);
    }

    const result = await this.query<T>(query, values);
    return result.rows;
  }

  /**
   * Insert a new record
   */
  async insert<T extends QueryResultRow = any>(table: string, data: Record<string, any>): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;
    
    const result = await this.query<T>(query, values);
    if (result.rows.length === 0) {
      throw new Error('Insert operation failed');
    }
    return result.rows[0] as T;
  }

  /**
   * Update a record by ID
   */
  async update<T extends QueryResultRow = any>(
    table: string, 
    id: string | number, 
    data: Record<string, any>,
    idColumn: string = 'id'
  ): Promise<T | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE ${table} 
      SET ${setClause} 
      WHERE ${idColumn} = $${columns.length + 1} 
      RETURNING *
    `;
    
    const result = await this.query<T>(query, [...values, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete a record by ID
   */
  async delete(table: string, id: string | number, idColumn: string = 'id'): Promise<boolean> {
    const query = `DELETE FROM ${table} WHERE ${idColumn} = $1`;
    const result = await this.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get count of records
   */
  async count(table: string, conditions?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const values: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    const result = await this.query<{ count: string }>(query, values);
    return parseInt(result.rows[0]?.count || '0');
  }
}

// Create and export the database service instance
export const db = new PostgreSQLService(pool);
