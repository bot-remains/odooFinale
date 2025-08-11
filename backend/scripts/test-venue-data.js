import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testVenueData() {
  try {
    console.log('Initializing database...');
    await connectDB();
    
    console.log('Testing venue data for owner ID 18...');
    
    // Get venue data as returned by the API
    const result = await query('SELECT * FROM venues WHERE owner_id = $1', [18]);
    
    console.log('Raw venue data from database:');
    result.rows.forEach(venue => {
      console.log({
        id: venue.id,
        name: venue.name,
        isApproved: venue.is_approved,
        contactPhone: venue.contact_phone,
        contactEmail: venue.contact_email,
        address: venue.address,
        location: venue.location
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

testVenueData();
