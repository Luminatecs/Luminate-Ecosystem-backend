import { Pool } from 'pg';
import * as readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'luminate_ecosystem',
});

class DatabaseConsole {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'luminate_db> '
    });
  }

  async start() {
    console.log('🗄️  Luminate Database Console');
    console.log('📝 Type SQL queries and press Enter. Type "exit" to quit.');
    console.log('💡 Try: SELECT * FROM users; or SELECT * FROM organizations;');
    console.log('─'.repeat(60));
    
    // Test connection
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT current_database(), current_user, now()');
      console.log(`✅ Connected to database: ${result.rows[0].current_database}`);
      console.log(`👤 User: ${result.rows[0].current_user}`);
      console.log(`⏰ Time: ${result.rows[0].now}`);
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }

    console.log('─'.repeat(60));
    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const query = input.trim();
      
      if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        console.log('👋 Goodbye!');
        await pool.end();
        this.rl.close();
        process.exit(0);
      }

      if (query.toLowerCase() === 'help') {
        this.showHelp();
        this.rl.prompt();
        return;
      }

      if (query.toLowerCase() === 'tables') {
        await this.showTables();
        this.rl.prompt();
        return;
      }

      if (query.toLowerCase().startsWith('desc ')) {
        const tableName = query.substring(5).trim();
        await this.describeTable(tableName);
        this.rl.prompt();
        return;
      }

      if (!query) {
        this.rl.prompt();
        return;
      }

      await this.executeQuery(query);
      this.rl.prompt();
    });

    this.rl.on('close', async () => {
      await pool.end();
      process.exit(0);
    });
  }

  private async executeQuery(sql: string) {
    try {
      const start = Date.now();
      const client = await pool.connect();
      
      try {
        const result = await client.query(sql);
        const duration = Date.now() - start;
        
        if (result.rows && result.rows.length > 0) {
          console.table(result.rows);
        }
        
        console.log(`✅ Query executed successfully (${duration}ms)`);
        console.log(`📊 Rows: ${result.rowCount || 0}`);
        
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Query error:', (error as Error).message);
    }
  }

  private async showTables() {
    const sql = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(sql);
        console.log('\n📋 Available Tables:');
        console.log('─'.repeat(40));
        result.rows.forEach(row => {
          console.log(`  ${row.table_name} (${row.table_type})`);
        });
        console.log();
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error showing tables:', (error as Error).message);
    }
  }

  private async describeTable(tableName: string) {
    const sql = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(sql, [tableName]);
        
        if (result.rows.length === 0) {
          console.log(`❌ Table '${tableName}' not found`);
          return;
        }
        
        console.log(`\n📋 Table Structure: ${tableName}`);
        console.log('─'.repeat(60));
        console.log('Column'.padEnd(20), 'Type'.padEnd(15), 'Nullable'.padEnd(10), 'Default');
        console.log('─'.repeat(60));
        
        result.rows.forEach(row => {
          console.log(
            row.column_name.padEnd(20),
            row.data_type.padEnd(15),
            row.is_nullable.padEnd(10),
            (row.column_default || '').substring(0, 20)
          );
        });
        console.log();
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error describing table:', (error as Error).message);
    }
  }

  private showHelp() {
    console.log('\n🆘 Database Console Help:');
    console.log('─'.repeat(40));
    console.log('  help         - Show this help');
    console.log('  tables       - List all tables');
    console.log('  desc <table> - Describe table structure');
    console.log('  exit/quit    - Exit console');
    console.log('');
    console.log('📝 SQL Examples:');
    console.log('  SELECT * FROM users LIMIT 10;');
    console.log('  SELECT count(*) FROM organizations;');
    console.log('  SELECT email, role FROM users WHERE role = \'super_admin\';');
    console.log('  UPDATE users SET is_active = true WHERE email = \'user@example.com\';');
    console.log('');
  }
}

// Start the console
const dbConsole = new DatabaseConsole();
dbConsole.start().catch(console.error);
