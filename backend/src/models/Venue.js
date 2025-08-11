import { query } from '../config/database.js';

class Venue {
  constructor(venueData) {
    this.id = venueData.id;
    this.name = venueData.name;
    this.description = venueData.description;
    this.address = venueData.address;
    this.location = venueData.location;
    this.amenities = venueData.amenities;
    this.photos = venueData.photos;
    this.rating = venueData.rating;
    this.totalReviews = venueData.total_reviews;
    this.ownerId = venueData.owner_id;
    this.isApproved = venueData.is_approved;
    this.contactEmail = venueData.contact_email;
    this.contactPhone = venueData.contact_phone;
    this.rejectionReason = venueData.rejection_reason;
    this.rejectedAt = venueData.rejected_at;
    this.rejectedBy = venueData.rejected_by;
    this.approvedAt = venueData.approved_at;
    this.approvedBy = venueData.approved_by;
    this.createdAt = venueData.created_at;
    this.updatedAt = venueData.updated_at;
  }

  // Create venues table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        amenities TEXT[], -- Array of amenities
        photos TEXT[], -- Array of photo URLs
        rating DECIMAL(2,1) DEFAULT 0.0,
        total_reviews INTEGER DEFAULT 0,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id);
      CREATE INDEX IF NOT EXISTS idx_venues_approved ON venues(is_approved);
      CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(location);
      CREATE INDEX IF NOT EXISTS idx_venues_rating ON venues(rating);

      -- Create trigger to update updated_at
      CREATE OR REPLACE FUNCTION update_venues_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
      CREATE TRIGGER update_venues_updated_at
          BEFORE UPDATE ON venues
          FOR EACH ROW
          EXECUTE FUNCTION update_venues_updated_at();
    `;

    try {
      await query(createTableQuery);
      console.log('✅ Venues table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating venues table:', error.message);
      throw error;
    }
  }

  // Create a new venue
  static async create(venueData) {
    const {
      name,
      description,
      address,
      location,
      amenities = [],
      photos = [],
      ownerId,
    } = venueData;

    const insertQuery = `
      INSERT INTO venues (name, description, address, location, amenities, photos, owner_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      name,
      description,
      address,
      location,
      amenities,
      photos,
      ownerId,
    ]);
    return new Venue(result.rows[0]);
  }

  // Find venue by ID
  static async findById(id) {
    const selectQuery = `
      SELECT v.*, u.name as owner_name, u.email as owner_email
      FROM venues v
      LEFT JOIN users u ON v.owner_id = u.id
      WHERE v.id = $1
    `;

    const result = await query(selectQuery, [id]);
    return result.rows.length > 0 ? new Venue(result.rows[0]) : null;
  }

  // Get all approved venues with filters
  static async findAll(filters = {}, limit = 20, offset = 0) {
    let whereClause = 'WHERE v.is_approved = true';
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (filters.sportType) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM courts c WHERE c.venue_id = v.id AND c.sport_type = $${paramCount}
      )`;
      params.push(filters.sportType);
      paramCount++;
    }

    if (filters.location) {
      whereClause += ` AND v.location ILIKE $${paramCount}`;
      params.push(`%${filters.location}%`);
      paramCount++;
    }

    if (filters.minRating) {
      whereClause += ` AND v.rating >= $${paramCount}`;
      params.push(filters.minRating);
      paramCount++;
    }

    if (filters.search) {
      whereClause += ` AND (v.name ILIKE $${paramCount} OR v.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    params.push(limit, offset);

    const selectQuery = `
      SELECT v.*,
             MIN(c.price_per_hour) as starting_price,
             ARRAY_AGG(DISTINCT c.sport_type) as available_sports
      FROM venues v
      LEFT JOIN courts c ON v.id = c.venue_id
      ${whereClause}
      GROUP BY v.id
      ORDER BY v.rating DESC, v.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(selectQuery, params);
    return result.rows.map((row) => new Venue(row));
  }

  // Get venues by owner
  static async findByOwner(ownerId) {
    const selectQuery = `
      SELECT * FROM venues
      WHERE owner_id = $1
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery, [ownerId]);
    return result.rows.map((row) => new Venue(row));
  }

  // Update venue
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(this.id);

    const updateQuery = `
      UPDATE venues
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    return new Venue(result.rows[0]);
  }

  // Approve venue (admin only)
  async approve() {
    const updateQuery = `
      UPDATE venues
      SET is_approved = true
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [this.id]);
    return new Venue(result.rows[0]);
  }

  // Update rating
  async updateRating() {
    const updateQuery = `
      UPDATE venues
      SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE venue_id = $1
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE venue_id = $1
      )
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [this.id]);
    return new Venue(result.rows[0]);
  }

  // Delete venue
  async delete() {
    const deleteQuery = `DELETE FROM venues WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [this.id]);
    return result.rows.length > 0;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      address: this.address,
      location: this.location,
      amenities: this.amenities,
      photos: this.photos,
      rating: parseFloat(this.rating) || 0,
      totalReviews: this.totalReviews || 0,
      ownerId: this.ownerId,
      isApproved: this.isApproved,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Venue;
