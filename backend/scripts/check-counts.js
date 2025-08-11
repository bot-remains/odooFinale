import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkActualCounts() {
  try {
    console.log('Initializing database...');
    await connectDB();
    
    // Check user counts
    console.log('\n=== USER COUNTS ===');
    const userCountsQuery = `
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      GROUP BY role
      ORDER BY role
    `;
    const userCounts = await query(userCountsQuery);
    console.log('Users by role:');
    userCounts.rows.forEach(row => {
      console.log(`- ${row.role}: ${row.count}`);
    });
    
    const totalUsers = await query('SELECT COUNT(*) as total FROM users');
    console.log(`Total users: ${totalUsers.rows[0].total}`);
    
    // Check venue counts
    console.log('\n=== VENUE COUNTS ===');
    const venueCountsQuery = `
      SELECT 
        is_approved,
        COUNT(*) as count
      FROM venues 
      GROUP BY is_approved
      ORDER BY is_approved
    `;
    const venueCounts = await query(venueCountsQuery);
    console.log('Venues by approval status:');
    venueCounts.rows.forEach(row => {
      console.log(`- ${row.is_approved ? 'Approved' : 'Pending'}: ${row.count}`);
    });
    
    const totalVenues = await query('SELECT COUNT(*) as total FROM venues');
    console.log(`Total venues: ${totalVenues.rows[0].total}`);
    
    // Check what the admin dashboard query is returning
    console.log('\n=== ADMIN DASHBOARD QUERY RESULTS ===');
    const adminQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'facility_owner') as total_owners,
        (SELECT COUNT(*) FROM venues) as total_venues,
        (SELECT COUNT(*) FROM venues WHERE is_approved = true) as approved_venues,
        (SELECT COUNT(*) FROM venues WHERE is_approved = false) as pending_venues
    `;
    const adminResults = await query(adminQuery);
    console.log('Admin dashboard stats:');
    const stats = adminResults.rows[0];
    console.log(`- Customers: ${stats.total_customers}`);
    console.log(`- Owners: ${stats.total_owners}`);
    console.log(`- Total calculated: ${parseInt(stats.total_customers) + parseInt(stats.total_owners)}`);
    console.log(`- Total venues: ${stats.total_venues}`);
    console.log(`- Approved venues: ${stats.approved_venues}`);
    console.log(`- Pending venues: ${stats.pending_venues}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

checkActualCounts();
