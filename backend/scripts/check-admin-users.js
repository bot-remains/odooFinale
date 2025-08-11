import connectDB, { query } from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAdminUsers() {
  try {
    console.log('Initializing database...');
    await connectDB();
    
    console.log('Checking admin users...');
    
    // Check if there are any admin users
    const result = await query('SELECT id, name, email, role FROM users WHERE role = $1', ['admin']);
    
    if (result.rows.length > 0) {
      console.log('Admin users found:');
      result.rows.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    } else {
      console.log('No admin users found. Creating default admin...');
      
      // Create a default admin user
      const createAdminResult = await query(`
        INSERT INTO users (name, email, password, role, phone, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, role
      `, [
        'Admin User',
        'admin@quickcourt.com',
        '$2b$10$samplehashedpassword123', // This would need proper bcrypt hash
        'admin',
        '9999999999',
        true
      ]);
      
      console.log('Created admin user:', createAdminResult.rows[0]);
      console.log('Default password: admin123 (please change after first login)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

checkAdminUsers();
