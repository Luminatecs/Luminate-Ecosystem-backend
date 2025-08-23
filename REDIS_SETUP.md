# Redis Server Management Scripts

## Quick Commands
```bash
# Start Redis (Docker)
docker-compose -f docker-compose.redis.yml up -d

# Stop Redis
docker-compose -f docker-compose.redis.yml down

# View Redis logs
docker-compose -f docker-compose.redis.yml logs -f redis

# Connect to Redis CLI
docker exec -it luminate-redis redis-cli
```

## Option 1: Docker (Recommended)

### Prerequisites:
- Install Docker Desktop: https://www.docker.com/products/docker-desktop

### Steps:
1. **Start Redis:**
   ```bash
   cd Backend
   docker-compose -f docker-compose.redis.yml up -d
   ```

2. **Verify it's running:**
   ```bash
   docker ps
   # Should show luminate-redis container running
   ```

3. **Test connection:**
   ```bash
   docker exec -it luminate-redis redis-cli ping
   # Should return PONG
   ```

## Option 2: Windows Installation

### Using Chocolatey:
```bash
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Redis
choco install redis-64

# Start Redis service
redis-server
```

### Manual Installation:
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Keep the terminal window open while Redis runs

## Option 3: WSL2 (Windows Subsystem for Linux)

```bash
# In WSL2 terminal:
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test
redis-cli ping
```

## Option 4: Cloud Redis (Production)

For production, consider:
- **Redis Labs**: https://redislabs.com/
- **AWS ElastiCache**: https://aws.amazon.com/elasticache/
- **Azure Cache for Redis**: https://azure.microsoft.com/en-us/services/cache/

## Environment Configuration

Create `.env` file in your Backend directory:
```env
# Local Redis (default)
REDIS_URL=redis://localhost:6379

# Or for Docker with custom settings:
# REDIS_URL=redis://username:password@localhost:6379

# For cloud Redis:
# REDIS_URL=rediss://username:password@hostname:port
```

## Testing Your Setup

Run this command to test if Redis is working:
```bash
cd Backend
npx ts-node test-redis.ts
```
