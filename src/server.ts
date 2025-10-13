import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { testConnection, closePool } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import organizationRoutes from './routes/org';
import libraryRoutes from './routes/library';
import resourcesRoutes from './routes/resources';
import enrollmentRoutes from './routes/enrollment';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // HTTP request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'OK' : 'Service Unavailable',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/enrollment', enrollmentRoutes);

app.get('/test', () => {
  console.log('🔥 Test endpoint hit!');
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Luminate Ecosystem API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      library: '/api/library',
      users: '/api/users',
      organizations: '/api/organizations',
      enrollment: '/api/enrollment'
    }
  });
});


// app.use(notFound);
app.use(errorHandler);

// Initialize server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api-docs`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        
        try {
          await closePool();
          console.log('👋 Shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
