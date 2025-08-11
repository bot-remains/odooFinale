import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import database and routes
import { connectDB } from './src/config/prisma.js';
import authRoutes from './src/routes/auth.js';
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
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
<<<<<<< HEAD
=======

>>>>>>> b98a7f5 (migrated to prisma)
// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/venue-management', venueManagementRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { query } = await import('./src/config/database.js');
    await query('SELECT 1');

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

<<<<<<< HEAD
    // Create tables if they don't exist (basic setup)
    await User.createTable();
    await Venue.createTable();
    await Court.createTable();
    await Booking.createTable();
    await Review.createTable();
    // await TimeSlot.createTable(); // Temporarily disabled due to column date error

    // Initialize new tables for extended functionality
    await initializeNewTables();
=======
    console.log('✅ All services initialized successfully');
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

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
