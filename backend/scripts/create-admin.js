import connectDB, { query } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  try {
    console.log('Initializing database...');
    await connectDB();
    
    console.log('Creating admin user...');
    
    const adminEmail = 'admin@quickcourt.com';
    const adminPassword = 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists with email:', adminEmail);
      
      // Update the password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, adminEmail]);
      console.log('Updated admin password');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const result = await query(`
        INSERT INTO users (name, email, password, role, phone, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, role
      `, [
        'Admin User',
        adminEmail,
        hashedPassword,
        'admin',
        '9999999999',
        true
      ]);
      
      console.log('Created admin user:', result.rows[0]);
    }
    
    console.log('✅ Admin credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

createAdminUser();
