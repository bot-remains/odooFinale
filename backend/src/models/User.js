import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.avatar = userData.avatar;
    this.role = userData.role || 'user';
    this.isActive = userData.is_active !== undefined ? userData.is_active : true;
    this.isVerified = userData.is_verified !== undefined ? userData.is_verified : false;
    this.otpCode = userData.otp_code;
    this.otpExpiry = userData.otp_expiry;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;
    this.lastLogin = userData.last_login;
  }

  // Create users table if it doesn't exist
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'facility_owner', 'admin')),
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        otp_code VARCHAR(6),
        otp_expiry TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create index on email for faster lookups
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

      -- Create trigger to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
      await query(createTableQuery);
      console.log('✅ Users table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating users table:', error.message);
      throw error;
    }
  }

  // Hash password before saving
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password, avatar, role = 'user', isVerified = false } = userData;

    try {
      // Hash password
      const hashedPassword = await this.hashPassword(password);

      let insertQuery, values;

      if (isVerified) {
        // Create user as already verified (no OTP needed)
        insertQuery = `
          INSERT INTO users (name, email, password, avatar, role, is_verified)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, name, email, avatar, role, is_active, is_verified, created_at, updated_at
        `;
        values = [name, email, hashedPassword, avatar, role, true];
      } else {
        // Create user with OTP for verification (legacy mode)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        insertQuery = `
          INSERT INTO users (name, email, password, avatar, role, otp_code, otp_expiry, is_verified)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, name, email, avatar, role, is_active, is_verified, created_at, updated_at
        `;
        values = [name, email, hashedPassword, avatar, role, otpCode, otpExpiry, false];
      }

      const result = await query(insertQuery, values);
      const user = new User(result.rows[0]);

      // Include OTP in response for email sending (only if not verified)
      if (!isVerified && values.length > 6) {
        user.otpCode = values[5]; // otpCode is at index 5
      }

      return user;
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new Error('User already exists with this email');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const selectQuery = `
      SELECT id, name, email, password, avatar, role, is_active, is_verified, last_login, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await query(selectQuery, [email]);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const selectQuery = `
      SELECT id, name, email, avatar, role, is_active, is_verified, last_login, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await query(selectQuery, [id]);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Verify OTP
  static async verifyOTP(email, otpCode) {
    const selectQuery = `
      SELECT id, name, email, avatar, role, is_active, is_verified, otp_code, otp_expiry, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await query(selectQuery, [email]);
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = new User(result.rows[0]);

    if (user.otpCode !== otpCode) {
      throw new Error('Invalid OTP code');
    }

    if (new Date() > new Date(user.otpExpiry)) {
      throw new Error('OTP code has expired');
    }

    // Mark user as verified
    const updateQuery = `
      UPDATE users
      SET is_verified = true, otp_code = NULL, otp_expiry = NULL
      WHERE id = $1
      RETURNING *
    `;

    const updateResult = await query(updateQuery, [user.id]);
    return new User(updateResult.rows[0]);
  }

  // Regenerate OTP
  async regenerateOTP() {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const updateQuery = `
      UPDATE users
      SET otp_code = $1, otp_expiry = $2
      WHERE id = $3
      RETURNING otp_code
    `;

    const result = await query(updateQuery, [otpCode, otpExpiry, this.id]);
    return result.rows[0].otp_code;
  }

  // Update last login
  async updateLastLogin() {
    const updateQuery = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING last_login
    `;

    const result = await query(updateQuery, [this.id]);
    this.lastLogin = result.rows[0].last_login;
    return this;
  }

  // Update user
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(this.id); // Add ID as last parameter

    const updateQuery = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, is_active, last_login, created_at, updated_at
    `;

    const result = await query(updateQuery, values);
    return new User(result.rows[0]);
  }

  // Delete user (soft delete)
  async delete() {
    const deleteQuery = `
      UPDATE users
      SET is_active = false
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(deleteQuery, [this.id]);
    return result.rows.length > 0;
  }

  // Get all users (admin only)
  static async findAll(limit = 10, offset = 0) {
    const selectQuery = `
      SELECT id, name, email, role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(selectQuery, [limit, offset]);
    return result.rows.map((row) => new User(row));
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      role: this.role,
      isActive: this.isActive,
      isVerified: this.isVerified,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default User;
