import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import database and routes
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import emailService from './src/services/emailService.js';
import User from './src/models/User.js';
import Venue from './src/models/Venue.js';
import Court from './src/models/Court.js';
import Booking from './src/models/Booking.js';
import Review from './src/models/Review.js';
import TimeSlot from './src/models/TimeSlot.js';
import { apiLimiter } from './src/middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting for API routes
app.use('/api/', apiLimiter);

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);

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
      venues: '/api/venues (coming soon)',
      courts: '/api/courts (coming soon)',
      bookings: '/api/bookings (coming soon)',
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
    // Connect to database
    await connectDB();

    try {
      await emailService.verifyConnection();
    } catch (error) {
      console.log('⚠️ Email service will be tested when first used');
    }

    // Create tables if they don't exist (basic setup)
    await User.createTable();
    await Venue.createTable();
    await Court.createTable();
    await Booking.createTable();
    await Review.createTable();
    await TimeSlot.createTable();

    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 QuickCourt API Server is running on http://${HOST}:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
