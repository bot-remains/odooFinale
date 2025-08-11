import { query } from '../config/database.js';

class Booking {
  constructor(bookingData) {
    this.id = bookingData.id;
    this.userId = bookingData.user_id;
    this.courtId = bookingData.court_id;
    this.venueId = bookingData.venue_id;
    this.bookingDate = bookingData.booking_date;
    this.startTime = bookingData.start_time;
    this.endTime = bookingData.end_time;
    this.totalAmount = bookingData.total_amount;
    this.status = bookingData.status;
    this.paymentStatus = bookingData.payment_status;
    this.paymentId = bookingData.payment_id;
    this.notes = bookingData.notes;
    this.createdAt = bookingData.created_at;
    this.updatedAt = bookingData.updated_at;
  }

  // Create bookings table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        court_id INTEGER REFERENCES courts(id) ON DELETE CASCADE,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        payment_id VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_court_id ON bookings(court_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

      -- Create unique constraint to prevent double booking
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_booking
      ON bookings(court_id, booking_date, start_time, end_time)
      WHERE status != 'cancelled';

      -- Create trigger to update updated_at
      CREATE OR REPLACE FUNCTION update_bookings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
      CREATE TRIGGER update_bookings_updated_at
          BEFORE UPDATE ON bookings
          FOR EACH ROW
          EXECUTE FUNCTION update_bookings_updated_at();
    `;

    try {
      await query(createTableQuery);
      console.log('✅ Bookings table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating bookings table:', error.message);
      throw error;
    }
  }

  // Create a new booking
  static async create(bookingData) {
    const { userId, courtId, venueId, bookingDate, startTime, endTime, totalAmount, notes } =
      bookingData;

    const insertQuery = `
      INSERT INTO bookings (user_id, court_id, venue_id, booking_date, start_time, end_time, total_amount, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    try {
      const result = await query(insertQuery, [
        userId,
        courtId,
        venueId,
        bookingDate,
        startTime,
        endTime,
        totalAmount,
        notes,
      ]);
      return new Booking(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new Error('This time slot is already booked');
      }
      throw error;
    }
  }

  // Find booking by ID
  static async findById(id) {
    const selectQuery = `
      SELECT b.*,
             u.name as user_name, u.email as user_email,
             c.name as court_name, c.sport_type,
             v.name as venue_name, v.location as venue_location
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN courts c ON b.court_id = c.id
      LEFT JOIN venues v ON b.venue_id = v.id
      WHERE b.id = $1
    `;

    const result = await query(selectQuery, [id]);
    return result.rows.length > 0 ? new Booking(result.rows[0]) : null;
  }

  // Get bookings by user
  static async findByUser(userId, status = null, limit = 20, offset = 0) {
    let whereClause = 'WHERE b.user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    params.push(limit, offset);

    const selectQuery = `
      SELECT b.*,
             c.name as court_name, c.sport_type,
             v.name as venue_name, v.location as venue_location
      FROM bookings b
      LEFT JOIN courts c ON b.court_id = c.id
      LEFT JOIN venues v ON b.venue_id = v.id
      ${whereClause}
      ORDER BY b.booking_date DESC, b.start_time DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(selectQuery, params);
    return result.rows.map((row) => new Booking(row));
  }

  // Get bookings by venue (for facility owners)
  static async findByVenue(venueId, status = null, date = null, limit = 20, offset = 0) {
    let whereClause = 'WHERE b.venue_id = $1';
    const params = [venueId];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (date) {
      whereClause += ` AND b.booking_date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    params.push(limit, offset);

    const selectQuery = `
      SELECT b.*,
             u.name as user_name, u.email as user_email,
             c.name as court_name, c.sport_type
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN courts c ON b.court_id = c.id
      ${whereClause}
      ORDER BY b.booking_date DESC, b.start_time DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(selectQuery, params);
    return result.rows.map((row) => new Booking(row));
  }

  // Get booking statistics for venue owner
  static async getVenueStats(venueId, startDate = null, endDate = null) {
    let dateFilter = '';
    const params = [venueId];
    let paramCount = 2;

    if (startDate && endDate) {
      dateFilter = ` AND b.booking_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(startDate, endDate);
    }

    const statsQuery = `
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_amount END), 0) as total_earnings,
        COUNT(DISTINCT court_id) as active_courts
      FROM bookings b
      WHERE venue_id = $1 ${dateFilter}
    `;

    const result = await query(statsQuery, params);
    return result.rows[0];
  }

  // Update booking status
  async updateStatus(newStatus) {
    const updateQuery = `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [newStatus, this.id]);
    return new Booking(result.rows[0]);
  }

  // Update payment status
  async updatePaymentStatus(paymentStatus, paymentId = null) {
    const updateQuery = `
      UPDATE bookings
      SET payment_status = $1, payment_id = $2
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateQuery, [paymentStatus, paymentId, this.id]);
    return new Booking(result.rows[0]);
  }

  // Cancel booking (only if in future)
  async cancel() {
    const now = new Date();
    const bookingDateTime = new Date(`${this.bookingDate} ${this.startTime}`);

    if (bookingDateTime <= now) {
      throw new Error('Cannot cancel past bookings');
    }

    return this.updateStatus('cancelled');
  }

  // Mark as completed
  async complete() {
    return this.updateStatus('completed');
  }

  // Check if booking can be cancelled
  canBeCancelled() {
    const now = new Date();
    const bookingDateTime = new Date(`${this.bookingDate} ${this.startTime}`);

    return bookingDateTime > now && this.status === 'confirmed';
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      courtId: this.courtId,
      venueId: this.venueId,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      endTime: this.endTime,
      totalAmount: parseFloat(this.totalAmount),
      status: this.status,
      paymentStatus: this.paymentStatus,
      paymentId: this.paymentId,
      notes: this.notes,
      canCancel: this.canBeCancelled(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Booking;
