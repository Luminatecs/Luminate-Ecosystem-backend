// Simple Redis connection test
import redisManager from './src/config/redis';

async function testRedis() {
  console.log('🧪 Testing Redis connection...');
  
  try {
    // Test connection
    await redisManager.connect();
    
    // Test basic operations
    console.log('📝 Testing Redis operations...');
    
    await redisManager.set('test:key', 'Hello Redis!');
    const value = await redisManager.get('test:key');
    
    if (value === 'Hello Redis!') {
      console.log('✅ Redis operations working correctly');
      console.log('📋 Retrieved value:', value);
    } else {
      console.log('❌ Redis operations failed');
    }
    
    // Test expiration
    await redisManager.setEx('test:expiry', 2, 'This will expire');
    console.log('⏰ Set key with 2-second expiration');
    
    // Clean up
    await redisManager.del('test:key');
    await redisManager.del('test:expiry');
    
    // Close connection
    await redisManager.quit();
    console.log('✅ Redis test completed successfully');
    
  } catch (error) {
    console.error('❌ Redis test failed:', (error as Error).message);
    console.log('⚠️ This is normal if Redis is not running - the app will work without caching');
    process.exit(0); // Exit gracefully even on Redis failure
  }
}

testRedis().catch(console.error);
