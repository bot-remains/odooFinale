import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

async function testAdminDashboard() {
  try {
    console.log('Testing admin dashboard API...');
    
    // First, let's create a test JWT token for admin user
    const jwt = await import('jsonwebtoken');
    const adminToken = jwt.default.sign(
      { userId: 16, role: 'admin' }, // Use the admin user ID we found
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Test the dashboard API
    const response = await fetch('http://localhost:3000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard API response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Dashboard API error:', response.status, await response.text());
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testAdminDashboard();
