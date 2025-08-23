import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'luminate_ecosystem',
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migrations...');
    
    // Create migrations table to track applied migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get already applied migrations
    const appliedMigrationsResult = await client.query(
      'SELECT filename FROM migrations ORDER BY filename'
    );
    const appliedMigrations = appliedMigrationsResult.rows.map(row => row.filename);

    // Apply new migrations
    for (const file of migrationFiles) {
      if (appliedMigrations.includes(file)) {
        console.log(`⏭️  Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`⚡ Applying migration: ${file}`);
      
      const migrationSQL = fs.readFileSync(
        path.join(migrationsDir, file), 
        'utf-8'
      );

      // Begin transaction for this migration
      await client.query('BEGIN');
      
      try {
        // Execute migration
        await client.query(migrationSQL);
        
        // Record migration as applied
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
        
        await client.query('COMMIT');
        console.log(`✅ Successfully applied migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✨ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
