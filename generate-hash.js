const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'TempPass123!';
  const hash = await bcrypt.hash(password, 12);
  console.log('\n=================================');
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('=================================\n');
  
  // Verify it works
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification:', isValid ? '✅ VALID' : '❌ INVALID');
}

generateHash().catch(console.error);
