const { Client } = require('pg');
require('dotenv').config();

async function checkUser() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const result = await client.query('SELECT username, email, is_active, password_hash FROM users WHERE username = $1', ['superadmin']);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('SuperAdmin user found:');
      console.log('- Username:', user.username);
      console.log('- Email:', user.email);
      console.log('- Active:', user.is_active);
      console.log('- Password hash starts with:', user.password_hash.substring(0, 20) + '...');
    } else {
      console.log('SuperAdmin user NOT found');
      
      // Let's see what users exist
      const allUsers = await client.query('SELECT username, email FROM users LIMIT 5');
      console.log('First 5 users in database:');
      allUsers.rows.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUser();
