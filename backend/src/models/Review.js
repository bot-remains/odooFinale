import { query } from '../config/database.js';

class Review {
  constructor(reviewData) {
    this.id = reviewData.id;
    this.userId = reviewData.user_id;
    this.venueId = reviewData.venue_id;
    this.bookingId = reviewData.booking_id;
    this.rating = reviewData.rating;
    this.comment = reviewData.comment;
    this.createdAt = reviewData.created_at;
    this.updatedAt = reviewData.updated_at;
  }

  // Create reviews table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_venue_id ON reviews(venue_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

      -- Ensure one review per booking
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_review_booking ON reviews(booking_id);

      -- Create trigger to update updated_at
      CREATE OR REPLACE FUNCTION update_reviews_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
      CREATE TRIGGER update_reviews_updated_at
          BEFORE UPDATE ON reviews
          FOR EACH ROW
          EXECUTE FUNCTION update_reviews_updated_at();
    `;

    try {
      await query(createTableQuery);
      console.log('✅ Reviews table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating reviews table:', error.message);
      throw error;
    }
  }

  // Create a new review
  static async create(reviewData) {
    const { userId, venueId, bookingId, rating, comment } = reviewData;

    const insertQuery = `
      INSERT INTO reviews (user_id, venue_id, booking_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const result = await query(insertQuery, [userId, venueId, bookingId, rating, comment]);
      return new Review(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new Error('Review already exists for this booking');
      }
      throw error;
    }
  }

  // Find review by ID
  static async findById(id) {
    const selectQuery = `
      SELECT r.*,
             u.name as user_name,
             v.name as venue_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN venues v ON r.venue_id = v.id
      WHERE r.id = $1
    `;

    const result = await query(selectQuery, [id]);
    return result.rows.length > 0 ? new Review(result.rows[0]) : null;
  }

  // Get reviews by venue
  static async findByVenue(venueId, limit = 20, offset = 0) {
    const selectQuery = `
      SELECT r.*,
             u.name as user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.venue_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(selectQuery, [venueId, limit, offset]);
    return result.rows.map((row) => new Review(row));
  }

  // Get reviews by user
  static async findByUser(userId, limit = 20, offset = 0) {
    const selectQuery = `
      SELECT r.*,
             v.name as venue_name
      FROM reviews r
      LEFT JOIN venues v ON r.venue_id = v.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(selectQuery, [userId, limit, offset]);
    return result.rows.map((row) => new Review(row));
  }

  // Update review
  async update(updateData) {
    const { rating, comment } = updateData;

    const updateQuery = `
      UPDATE reviews
      SET rating = $1, comment = $2
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateQuery, [rating, comment, this.id]);
    return new Review(result.rows[0]);
  }

  // Delete review
  async delete() {
    const deleteQuery = `DELETE FROM reviews WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [this.id]);
    return result.rows.length > 0;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      venueId: this.venueId,
      bookingId: this.bookingId,
      rating: this.rating,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Review;
