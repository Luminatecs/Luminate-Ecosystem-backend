const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'luminateEcosystem',
  user: 'postgres',
  password: 'ardiy1234'
});

(async () => {
  try {
    const result = await pool.query(`
      SELECT 
        tc.temp_code,
        tc.temp_password,
        tc.is_used,
        tc.expires_at,
        tc.expires_at > NOW() as is_valid,
        u.name,
        u.email
      FROM temporary_credentials tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.temp_code LIKE 'lumtempcode-a%'
      ORDER BY tc.temp_code
      LIMIT 5
    `);
    
    console.log('\n📋 Temporary Credentials Status:\n');
    result.rows.forEach((r, i) => {
      console.log(`${i + 1}. ${r.name}`);
      console.log(`   Code: ${r.temp_code}`);
      console.log(`   Used: ${r.is_used}`);
      console.log(`   Valid: ${r.is_valid}`);
      console.log(`   Expires: ${r.expires_at}`);
      console.log(`   Hash: ${r.temp_password.substring(0, 30)}...`);
      console.log(`   Email: ${r.email}`);
      console.log('');
    });
    
    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
