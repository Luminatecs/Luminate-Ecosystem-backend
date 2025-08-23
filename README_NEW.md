# Luminate Ecosystem Backend

A robust Node.js Express server with PostgreSQL integration, built with TypeScript and featuring comprehensive database abstraction layers.

## Features

- 🚀 **Express.js** - Fast, minimalist web framework
- 🔒 **JWT Authentication** - Secure user authentication and authorization
- 🐘 **PostgreSQL** - Powerful relational database with connection pooling
- 📝 **TypeScript** - Type-safe development
- 🏗️ **Repository Pattern** - Clean architecture with data abstraction
- 🔄 **Database Migrations** - Version-controlled schema management
- 🛡️ **Security Middleware** - Helmet, CORS, and rate limiting
- 📊 **Request Logging** - Morgan HTTP request logger
- 🔧 **Environment Configuration** - Flexible configuration management

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection configuration
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   ├── errorHandler.ts      # Global error handling
│   │   └── notFound.ts          # 404 handler
│   ├── repositories/
│   │   ├── UserRepository.ts     # User data access layer
│   │   └── OrganizationRepository.ts # Organization data access layer
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   ├── users.ts             # User management routes
│   │   └── organizations.ts     # Organization routes
│   ├── services/
│   │   ├── database.ts          # Database service with pool management
│   │   ├── UserService.ts       # User business logic
│   │   └── OrganizationService.ts # Organization business logic
│   ├── scripts/
│   │   └── migrate.ts           # Database migration runner
│   ├── types/
│   │   └── database.ts          # Type definitions
│   └── server.ts                # Express server setup
├── migrations/
│   ├── 001_initial_schema.sql   # Database schema
│   └── 002_seed_data.sql        # Sample data
└── package.json
```

## Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **PostgreSQL** >= 12.0

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=luminate_ecosystem
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE luminate_ecosystem;
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run db:setup` - Alias for migrate
- `npm run clean` - Clean build directory

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change user password
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create new organization (admin only)
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization (admin only)

### Health Check
- `GET /health` - Server and database health status

## Database Features

### Connection Pool Management
- **Pool Size**: Configurable min/max connections
- **Connection Timeout**: Automatic timeout handling
- **Graceful Shutdown**: Proper connection cleanup
- **Health Monitoring**: Real-time connection status

### Repository Pattern
- **Generic CRUD Operations**: Common database operations
- **Type Safety**: Full TypeScript support
- **Transaction Support**: Atomic operations
- **Query Builder**: Flexible query construction

### Available Database Methods
```typescript
// Generic operations
db.query<T>(sql, params)
db.findById<T>(table, id)
db.findMany<T>(table, conditions, options)
db.insert<T>(table, data)
db.update<T>(table, id, data)
db.delete(table, id)
db.exists(table, conditions)
db.count(table, conditions)

// Transaction support
db.transaction(async (client) => {
  // Multiple operations within transaction
})
```

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user|admin|super_admin",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### User Roles
- **user**: Basic access to own resources
- **admin**: Organization management and user oversight
- **super_admin**: Full system access

## Sample Data

The system includes sample data for testing:

### Users
- **admin@luminate-tech.com** - Super Admin (password: password123)
- **manager@luminate-tech.com** - Admin (password: password123)
- **user@demo.com** - Regular User (password: password123)

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3001 with:
- Hot reload on file changes
- Database connection pooling
- JWT authentication
- Comprehensive error handling
- Request logging

## License

MIT License
