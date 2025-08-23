import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UserService } from '../services/UserService';
import { OrganizationService } from '../services/OrganizationService';
import { UserRole } from '../models/Auth/interfaces';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'luminate_ecosystem',
});

class DatabaseManager {
  private userService: UserService;
  private organizationService: OrganizationService;

  constructor() {
    this.userService = new UserService();
    this.organizationService = new OrganizationService();
  }

  /**
   * Create a super admin user
   */
  async createSuperAdmin(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    try {
      console.log('🔐 Creating super admin user...');
      
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const client = await pool.connect();
      try {
        // Check if user already exists
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
          console.log('❌ User with this email already exists');
          return;
        }

        // Create super admin user directly in database
        const result = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING id, email, first_name, last_name, role`,
          [email, hashedPassword, firstName, lastName, UserRole.SUPER_ADMIN, true]
        );

        const newUser = result.rows[0];
        console.log('✅ Super admin created successfully:');
        console.log(`   ID: ${newUser.id}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Name: ${newUser.first_name} ${newUser.last_name}`);
        console.log(`   Role: ${newUser.role}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error creating super admin:', error);
    }
  }

  /**
   * List all users
   */
  async listUsers(): Promise<void> {
    try {
      console.log('👥 Listing all users...');
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT id, email, first_name, last_name, role, is_active, created_at, last_login_at, organization_id 
           FROM users 
           ORDER BY created_at DESC`
        );

        if (result.rows.length === 0) {
          console.log('📭 No users found');
          return;
        }

        console.log('\n📋 Users List:');
        console.log('─'.repeat(100));
        console.log('Email'.padEnd(30), 'Name'.padEnd(20), 'Role'.padEnd(15), 'Status'.padEnd(10), 'Created');
        console.log('─'.repeat(100));

        result.rows.forEach(user => {
          const status = user.is_active ? 'Active' : 'Inactive';
          const createdAt = new Date(user.created_at).toLocaleDateString();
          console.log(
            user.email.padEnd(30),
            `${user.first_name} ${user.last_name}`.padEnd(20),
            user.role.padEnd(15),
            status.padEnd(10),
            createdAt
          );
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error listing users:', error);
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(email: string, newRole: UserRole): Promise<void> {
    try {
      console.log(`🔄 Updating user role for ${email} to ${newRole}...`);
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          'UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, role',
          [newRole, email]
        );

        if (result.rows.length === 0) {
          console.log('❌ User not found');
          return;
        }

        const user = result.rows[0];
        console.log('✅ User role updated successfully:');
        console.log(`   Email: ${user.email}`);
        console.log(`   New Role: ${user.role}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error updating user role:', error);
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(email: string, newPassword: string): Promise<void> {
    try {
      console.log(`🔑 Resetting password for ${email}...`);
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email',
          [hashedPassword, email]
        );

        if (result.rows.length === 0) {
          console.log('❌ User not found');
          return;
        }

        console.log('✅ Password reset successfully');
        console.log(`   Email: ${email}`);
        console.log(`   New Password: ${newPassword}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error);
    }
  }

  /**
   * Create organization
   */
  async createOrganization(name: string, description?: string, website?: string): Promise<void> {
    try {
      console.log(`🏢 Creating organization: ${name}...`);
      
      const orgData: any = { name };
      if (description) orgData.description = description;
      if (website) orgData.website = website;
      
      const organization = await this.organizationService.createOrganization(orgData);

      console.log('✅ Organization created successfully:');
      console.log(`   ID: ${organization.id}`);
      console.log(`   Name: ${organization.name}`);
      console.log(`   Description: ${organization.description || 'N/A'}`);
      console.log(`   Website: ${organization.website || 'N/A'}`);
    } catch (error) {
      console.error('❌ Error creating organization:', error);
    }
  }

  /**
   * List all organizations
   */
  async listOrganizations(): Promise<void> {
    try {
      console.log('🏢 Listing all organizations...');
      
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT id, name, description, website, is_active, created_at,
           (SELECT COUNT(*) FROM users WHERE organization_id = organizations.id) as user_count
           FROM organizations 
           ORDER BY created_at DESC`
        );

        if (result.rows.length === 0) {
          console.log('📭 No organizations found');
          return;
        }

        console.log('\n📋 Organizations List:');
        console.log('─'.repeat(80));
        console.log('Name'.padEnd(25), 'Status'.padEnd(10), 'Users'.padEnd(8), 'Created');
        console.log('─'.repeat(80));

        result.rows.forEach(org => {
          const status = org.is_active ? 'Active' : 'Inactive';
          const createdAt = new Date(org.created_at).toLocaleDateString();
          console.log(
            org.name.padEnd(25),
            status.padEnd(10),
            org.user_count.toString().padEnd(8),
            createdAt
          );
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error listing organizations:', error);
    }
  }

  /**
   * Run custom SQL query
   */
  async runQuery(sql: string, params: any[] = []): Promise<void> {
    try {
      console.log('📊 Running custom query...');
      console.log('SQL:', sql);
      console.log('Parameters:', params);
      
      const client = await pool.connect();
      try {
        const result = await client.query(sql, params);
        
        console.log('✅ Query executed successfully');
        console.log(`Rows affected: ${result.rowCount}`);
        
        if (result.rows.length > 0) {
          console.log('\nResults:');
          console.table(result.rows);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error executing query:', error);
    }
  }

  /**
   * Database health check
   */
  async healthCheck(): Promise<void> {
    try {
      console.log('🏥 Performing database health check...');
      
      const client = await pool.connect();
      try {
        // Test connection
        const result = await client.query('SELECT NOW() as current_time, version()');
        
        // Get table counts
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        const orgCount = await client.query('SELECT COUNT(*) as count FROM organizations');
        const migrationCount = await client.query('SELECT COUNT(*) as count FROM migrations');
        
        console.log('✅ Database is healthy');
        console.log(`   Current Time: ${result.rows[0].current_time}`);
        console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}`);
        console.log(`   Total Users: ${userCount.rows[0].count}`);
        console.log(`   Total Organizations: ${orgCount.rows[0].count}`);
        console.log(`   Applied Migrations: ${migrationCount.rows[0].count}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Database health check failed:', error);
    }
  }

  async close(): Promise<void> {
    await pool.end();
  }
}

// CLI Interface
async function main() {
  const dbManager = new DatabaseManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'create-super-admin':
        if (args.length < 4) {
          console.log('Usage: npm run db:admin create-super-admin <email> <password> <firstName> <lastName>');
          break;
        }
        await dbManager.createSuperAdmin(args[0]!, args[1]!, args[2]!, args[3]!);
        break;

      case 'list-users':
        await dbManager.listUsers();
        break;

      case 'update-role':
        if (args.length < 2) {
          console.log('Usage: npm run db:admin update-role <email> <role>');
          console.log('Available roles: user, admin, super_admin');
          break;
        }
        await dbManager.updateUserRole(args[0]!, args[1]! as UserRole);
        break;

      case 'reset-password':
        if (args.length < 2) {
          console.log('Usage: npm run db:admin reset-password <email> <newPassword>');
          break;
        }
        await dbManager.resetUserPassword(args[0]!, args[1]!);
        break;

      case 'create-org':
        if (args.length < 1) {
          console.log('Usage: npm run db:admin create-org <name> [description] [website]');
          break;
        }
        await dbManager.createOrganization(args[0]!, args[1], args[2]);
        break;

      case 'list-orgs':
        await dbManager.listOrganizations();
        break;

      case 'health':
        await dbManager.healthCheck();
        break;

      case 'query':
        if (args.length < 1) {
          console.log('Usage: npm run db:admin query "<SQL_QUERY>"');
          break;
        }
        await dbManager.runQuery(args[0]!);
        break;

      default:
        console.log('🛠️  Database Admin Tool');
        console.log('');
        console.log('Available commands:');
        console.log('  create-super-admin <email> <password> <firstName> <lastName>  - Create super admin user');
        console.log('  list-users                                                   - List all users');
        console.log('  update-role <email> <role>                                   - Update user role');
        console.log('  reset-password <email> <newPassword>                         - Reset user password');
        console.log('  create-org <name> [description] [website]                    - Create organization');
        console.log('  list-orgs                                                    - List organizations');
        console.log('  health                                                       - Database health check');
        console.log('  query "<SQL>"                                                - Run custom SQL query');
        console.log('');
        console.log('Examples:');
        console.log('  npm run db:admin create-super-admin admin@company.com password123 Admin User');
        console.log('  npm run db:admin list-users');
        console.log('  npm run db:admin update-role user@example.com admin');
        console.log('  npm run db:admin health');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
  } finally {
    await dbManager.close();
    process.exit(0);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}

export { DatabaseManager };
