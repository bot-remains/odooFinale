import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import database and routes
import { connectDB } from './src/config/prisma.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import venueManagementRoutes from './src/routes/venueManagement.js';
import publicRoutes from './src/routes/public.js';
import bookingRoutes from './src/routes/bookings.js';
import reviewRoutes from './src/routes/reviews.js';
import adminRoutes from './src/routes/admin.js';
import notificationRoutes from './src/routes/notifications.js';
import paymentRoutes from './src/routes/payments.js';
import emailService from './src/services/emailService.js';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for reverse proxy support
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Allowed origins for production
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:8083',
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// CORS debugging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.url} - Origin: ${req.get('Origin') || 'none'}`);
  }
  next();
});

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/venue-management', venueManagementRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection with Prisma
    const prisma = (await import('./src/config/prisma.js')).default;
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'QuickCourt API Server - Sports Booking Platform',
    version: '1.0.0',
    description: 'A platform for booking local sports facilities and creating matches',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      venueManagement: '/api/venue-management',
      public: '/api/public',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      admin: '/api/admin',
      notifications: '/api/notifications',
      payments: '/api/payments',
    },
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Default error status
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database with Prisma
    await connectDB();

    try {
      await emailService.verifyConnection();
    } catch (error) {
      console.log('⚠️ Email service will be tested when first used');
    }

    // Prisma handles table creation via migrations
    console.log('✅ Database schema ready (managed by Prisma)');

    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 QuickCourt API Server is running on http://${HOST}:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log('🎯 Using Prisma ORM for database operations');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
