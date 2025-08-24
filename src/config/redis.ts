import { createClient, RedisClientType } from 'redis';

class RedisManager {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private isConnecting = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              console.error('❌ Redis: Too many reconnection attempts');
              return false;
            }
            return Math.min(retries * 100, 3000);
          },
          connectTimeout: 5000,
        },
        // Disable retry on specific errors
        disableOfflineQueue: true,
      });

      // Event listeners
      this.client.on('connect', () => {
        console.log('🔄 Redis: Attempting to connect...');
        this.isConnecting = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis: Connected and ready');
        this.isConnected = true;
        this.isConnecting = false;
      });

      this.client.on('error', (err: any) => {
        console.error('❌ Redis connection error:', err.message);
        this.isConnected = false;
        this.isConnecting = false;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis: Connection ended');
        this.isConnected = false;
        this.isConnecting = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis: Reconnecting...');
        this.isConnecting = true;
      });

    } catch (error) {
      console.error('❌ Redis: Failed to initialize client:', error);
    }
  }

  async connect(): Promise<void> {
    if (!this.client) {
      console.warn('⚠️ Redis: Client not initialized, skipping connection');
      return;
    }

    if (this.isConnected) {
      console.log('✅ Redis: Already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('⏳ Redis: Connection in progress...');
      return;
    }

    try {
      this.isConnecting = true;
      await this.client.connect();
      console.log('✅ Redis: Connection established');
    } catch (error) {
      console.warn('⚠️ Redis: Failed to connect, continuing without cache:', (error as Error).message);
      this.isConnected = false;
      this.isConnecting = false;
      // Don't throw error - allow app to continue without Redis
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Redis: Client not connected, skipping cache read');
      return null;
    }

    try {
      const result = await this.client.get(key);
      // Handle different Redis client return types
      return typeof result === 'string' ? result : null;
    } catch (error) {
      console.error('❌ Redis: Failed to get key:', key, error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Redis: Client not connected, skipping cache write');
      return;
    }

    try {
      await this.client.set(key, value);
    } catch (error) {
      console.error('❌ Redis: Failed to set key:', key, error);
    }
  }

  async setEx(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Redis: Client not connected, skipping cache write');
      return;
    }

    try {
      await this.client.setEx(key, seconds, value);
    } catch (error) {
      console.error('❌ Redis: Failed to setEx key:', key, error);
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Redis: Client not connected, skipping cache deletion');
      return 0;
    }

    try {
      return await this.client.del(key);
    } catch (error) {
      console.error('❌ Redis: Failed to delete key:', key, error);
      return 0;
    }
  }

  async quit(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
      this.isConnected = false;
      console.log('🔌 Redis: Connection closed gracefully');
    } catch (error) {
      console.error('❌ Redis: Error during quit:', error);
    }
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('❌ Redis: Connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const redisManager = new RedisManager();

// Export the manager instance with fallback methods
export default redisManager;

// Export a simple interface for type checking
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  setEx(key: string, seconds: number, value: string): Promise<void>;
  del(key: string): Promise<number>;
  quit(): Promise<void>;
  connect(): Promise<void>;
  isConnected(): boolean;
}
