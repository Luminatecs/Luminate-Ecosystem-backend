import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchoolDataTable() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔌 Connecting to database...');
    
    // Check if school_data table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'school_data'
      );
    `);
    
    console.log('📋 school_data table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Check table structure
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'school_data'
        ORDER BY ordinal_position;
      `);
      
      console.log('📊 Table columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
      // Check if there's any data
      const count = await pool.query('SELECT COUNT(*) FROM school_data');
      console.log('📈 Total records:', count.rows[0].count);
      
      // Test a simple search
      try {
        const searchResult = await pool.query(`
          SELECT * FROM school_data 
          WHERE "SCHOOL" ILIKE $1 
          LIMIT 5
        `, ['%test%']);
        console.log('🔍 Sample search results:', searchResult.rows.length);
      } catch (searchError) {
        console.error('❌ Search error:', searchError);
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await pool.end();
    console.log('🔒 Database connection closed');
  }
}

checkSchoolDataTable();
