import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function approveVenue() {
  try {
    console.log('Initializing database...');
    await connectDB();
    
    console.log('Approving venue ID 13...');
    
    // Approve the venue
    const result = await query(
      'UPDATE venues SET is_approved = true, approved_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [13]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Venue 13 has been approved successfully!');
      console.log('Updated venue:', JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ Failed to approve venue 13');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

approveVenue();
