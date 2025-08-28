const { Pool } = require('pg');

async function testUserData() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'luminate_ecosystem',
    password: 'password',
    port: 5432,
  });

  try {
    // Query the organization admin user
    const result = await pool.query(
      'SELECT id, username, role, organization_id, organization_setup_complete FROM users WHERE role = $1',
      ['ORG_ADMIN']
    );
    
    console.log('Organization Admin Users:');
    console.log(result.rows);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('\n📊 User Details:');
      console.log('ID:', user.id);
      console.log('Username:', user.username);
      console.log('Role:', user.role);
      console.log('Organization ID:', user.organization_id);
      console.log('Organization Setup Complete:', user.organization_setup_complete);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testUserData();
