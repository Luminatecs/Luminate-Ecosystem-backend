#!/bin/bash

# Redis Management Script

case "$1" in
  start)
    echo "🚀 Starting Redis server..."
    if command -v docker &> /dev/null; then
      echo "Using Docker..."
      docker-compose -f docker-compose.redis.yml up -d
      echo "✅ Redis started on localhost:6379"
    elif command -v redis-server &> /dev/null; then
      echo "Using local Redis installation..."
      redis-server --daemonize yes
      echo "✅ Redis started on localhost:6379"
    else
      echo "❌ Redis not found. Please install Redis or Docker."
      echo "📖 See REDIS_SETUP.md for installation instructions"
      exit 1
    fi
    ;;
  
  stop)
    echo "🛑 Stopping Redis server..."
    if docker ps -q -f name=luminate-redis; then
      docker-compose -f docker-compose.redis.yml down
      echo "✅ Docker Redis stopped"
    elif pgrep redis-server > /dev/null; then
      pkill redis-server
      echo "✅ Local Redis stopped"
    else
      echo "ℹ️ Redis is not running"
    fi
    ;;
  
  status)
    echo "📊 Checking Redis status..."
    if docker ps -q -f name=luminate-redis > /dev/null; then
      echo "✅ Docker Redis is running"
      docker exec -it luminate-redis redis-cli ping
    elif pgrep redis-server > /dev/null; then
      echo "✅ Local Redis is running"
      redis-cli ping
    else
      echo "❌ Redis is not running"
    fi
    ;;
  
  test)
    echo "🧪 Testing Redis connection..."
    npx ts-node test-redis.ts
    ;;
  
  cli)
    echo "🖥️ Opening Redis CLI..."
    if docker ps -q -f name=luminate-redis > /dev/null; then
      docker exec -it luminate-redis redis-cli
    else
      redis-cli
    fi
    ;;
  
  logs)
    echo "📋 Showing Redis logs..."
    if docker ps -q -f name=luminate-redis > /dev/null; then
      docker-compose -f docker-compose.redis.yml logs -f redis
    else
      echo "Not available for local Redis installation"
    fi
    ;;
  
  *)
    echo "Redis Management Script"
    echo ""
    echo "Usage: $0 {start|stop|status|test|cli|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start Redis server"
    echo "  stop    - Stop Redis server"
    echo "  status  - Check if Redis is running"
    echo "  test    - Test Redis connection with your app"
    echo "  cli     - Open Redis command line interface"
    echo "  logs    - Show Redis logs (Docker only)"
    echo ""
    echo "📖 For setup instructions, see REDIS_SETUP.md"
    exit 1
    ;;
esac
