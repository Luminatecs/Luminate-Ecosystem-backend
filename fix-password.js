const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function updateSuperAdminPassword() {
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
    
    // Hash the password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('New password hash:', hashedPassword);
    
    // Update the superadmin user with the new password hash
    const result = await client.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username, email', 
      [hashedPassword, 'superadmin']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ SuperAdmin password updated successfully');
      console.log('User:', result.rows[0]);
    } else {
      console.log('❌ SuperAdmin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

updateSuperAdminPassword();
