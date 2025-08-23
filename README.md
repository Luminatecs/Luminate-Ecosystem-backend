# Luminate Ecosystem Backend

A Node.js Express server built with TypeScript for the Luminate Ecosystem project.

## Features

- **Express.js** - Fast, unopinionated, minimalist web framework
- **TypeScript** - Type safety and modern JavaScript features
- **CORS** - Cross-Origin Resource Sharing enabled
- **Helmet** - Security middleware for HTTP headers
- **Morgan** - HTTP request logging
- **Environment Configuration** - Secure environment variable management
- **Error Handling** - Centralized error handling middleware
- **Health Check** - Built-in health check endpoint

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on http://localhost:3001

2. The server will automatically restart when you make changes to the code.

### Production

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── middleware/          # Express middleware
│   ├── errorHandler.ts  # Error handling middleware
│   └── notFound.ts      # 404 handler
├── routes/              # API routes
│   ├── auth.ts         # Authentication routes
│   ├── users.ts        # User management routes
│   └── organizations.ts # Organization routes
└── server.ts           # Main server file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | Database connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm run dev:ts` | Start development server with ts-node |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run clean` | Remove build directory |
| `npm test` | Run tests (to be implemented) |
| `npm run lint` | Lint TypeScript files |
| `npm run format` | Format code with Prettier |

## Next Steps

This is a basic scaffold with placeholder endpoints. To fully implement the backend:

1. **Database Integration**
   - Add database ORM (Prisma, TypeORM, or Sequelize)
   - Set up database migrations
   - Implement data models

2. **Authentication & Authorization**
   - Implement JWT authentication
   - Add password hashing (bcrypt)
   - Create authentication middleware
   - Implement role-based access control

3. **Validation**
   - Add request validation (Joi, Zod, or express-validator)
   - Implement input sanitization

4. **Testing**
   - Add testing framework (Jest, Mocha)
   - Write unit and integration tests
   - Set up test database

5. **Documentation**
   - Add API documentation (Swagger/OpenAPI)
   - Create API documentation endpoints

6. **Monitoring & Logging**
   - Implement structured logging
   - Add monitoring and metrics
   - Set up error tracking

## License

MIT
