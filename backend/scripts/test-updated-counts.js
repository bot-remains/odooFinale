import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testUpdatedCounts() {
  try {
    console.log('Testing updated admin dashboard query...');
    await connectDB();
    
    // Test the updated admin query
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'facility_owner') as total_owners,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM venues) as total_venues,
        (SELECT COUNT(*) FROM venues WHERE is_approved = true) as approved_venues,
        (SELECT COUNT(*) FROM venues WHERE is_approved = false) as pending_venues
    `;
    
    const result = await query(statsQuery);
    const stats = result.rows[0];
    
    console.log('\n✅ Updated Admin Dashboard Stats:');
    console.log(`- Total Users: ${stats.total_users} (Customers: ${stats.total_customers}, Owners: ${stats.total_owners}, Admins: ${stats.total_admins})`);
    console.log(`- Total Venues: ${stats.total_venues} (Approved: ${stats.approved_venues}, Pending: ${stats.pending_venues})`);
    
    console.log('\n🎯 Expected Frontend Display:');
    console.log(`- Total Users: ${stats.total_users}`);
    console.log(`- Total Venues: ${stats.total_venues}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

testUpdatedCounts();
