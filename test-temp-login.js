const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testTempLogin() {
  try {
    console.log('\n🔐 Testing Temp Code Login...\n');
    
    const tempCode = 'lumtempcode-a1111111-0001-4001-8001-000000000001';
    const password = 'TempPass123!';
    
    console.log('Credentials:');
    console.log('  Temp Code:', tempCode);
    console.log('  Password:', password);
    console.log('');
    
    const response = await axios.post(`${API_URL}/auth/temp-login`, {
      tempCode,
      password
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERROR!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testTempLogin();
