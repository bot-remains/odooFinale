import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkVenue() {
  try {
    console.log('Initializing database...');
    await connectDB();
    
    console.log('Checking venue ID 13...');
    
    // Check if venue exists
    const result = await query('SELECT * FROM venues WHERE id = $1', [13]);
    console.log('Venue 13 data:', JSON.stringify(result.rows, null, 2));
    
    if (result.rows.length === 0) {
      console.log('No venue found with ID 13');
      
      // Get all venues
      const allVenues = await query('SELECT id, name, is_approved, owner_id FROM venues ORDER BY id');
      console.log('All venues:', JSON.stringify(allVenues.rows, null, 2));
    } else {
      const venue = result.rows[0];
      console.log(`Venue 13 found: ${venue.name}`);
      console.log(`Is approved: ${venue.is_approved}`);
      console.log(`Owner ID: ${venue.owner_id}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

checkVenue();
