import dotenv from 'dotenv';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import Venue from '../src/models/Venue.js';
import Court from '../src/models/Court.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';
import TimeSlot from '../src/models/TimeSlot.js';

dotenv.config();

const initializeDatabase = async () => {
  try {
    console.log('Initializing QuickCourt database...');

    // Connect to database
    await connectDB();

    // Create tables
    console.log('Creating tables...');
    await User.createTable();
    await Venue.createTable();
    await Court.createTable();
    await Booking.createTable();
    await Review.createTable();
    await TimeSlot.createTable();

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initializeDatabase();
