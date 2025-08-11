import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCourts() {
  try {
    await connectDB();
    const courts = await query('SELECT * FROM courts WHERE venue_id = $1', [13]);
    console.log('Courts for venue 13:', JSON.stringify(courts.rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCourts();
