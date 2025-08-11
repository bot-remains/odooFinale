import { query } from '../config/database.js';

class Court {
  constructor(courtData) {
    this.id = courtData.id;
    this.venueId = courtData.venue_id;
    this.name = courtData.name;
    this.sportType = courtData.sport_type;
    this.pricePerHour = courtData.price_per_hour;
    this.operatingHours = courtData.operating_hours;
    this.isActive = courtData.is_active;
    this.createdAt = courtData.created_at;
    this.updatedAt = courtData.updated_at;
  }

  // Create courts table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sport_type VARCHAR(100) NOT NULL,
        price_per_hour DECIMAL(10,2) NOT NULL,
        operating_hours JSONB DEFAULT '{"start": "06:00", "end": "22:00"}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_courts_venue_id ON courts(venue_id);
      CREATE INDEX IF NOT EXISTS idx_courts_sport_type ON courts(sport_type);
      CREATE INDEX IF NOT EXISTS idx_courts_active ON courts(is_active);

      -- Create trigger to update updated_at
      CREATE OR REPLACE FUNCTION update_courts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_courts_updated_at ON courts;
      CREATE TRIGGER update_courts_updated_at
          BEFORE UPDATE ON courts
          FOR EACH ROW
          EXECUTE FUNCTION update_courts_updated_at();
    `;

    try {
      await query(createTableQuery);
      console.log('✅ Courts table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating courts table:', error.message);
      throw error;
    }
  }

  // Create a new court
  static async create(courtData) {
    const { venueId, name, sportType, pricePerHour, operatingHours } = courtData;

    const insertQuery = `
      INSERT INTO courts (venue_id, name, sport_type, price_per_hour, operating_hours)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      venueId,
      name,
      sportType,
      pricePerHour,
      operatingHours,
    ]);
    return new Court(result.rows[0]);
  }

  // Find court by ID
  static async findById(id) {
    const selectQuery = `
      SELECT c.*, v.name as venue_name, v.location as venue_location
      FROM courts c
      LEFT JOIN venues v ON c.venue_id = v.id
      WHERE c.id = $1
    `;

    const result = await query(selectQuery, [id]);
    return result.rows.length > 0 ? new Court(result.rows[0]) : null;
  }

  // Get courts by venue
  static async findByVenue(venueId) {
    const selectQuery = `
      SELECT * FROM courts
      WHERE venue_id = $1 AND is_active = true
      ORDER BY sport_type, name
    `;

    const result = await query(selectQuery, [venueId]);
    return result.rows.map((row) => new Court(row));
  }

  // Get courts by sport type
  static async findBySportType(sportType, limit = 20, offset = 0) {
    const selectQuery = `
      SELECT c.*, v.name as venue_name, v.location as venue_location, v.rating as venue_rating
      FROM courts c
      JOIN venues v ON c.venue_id = v.id
      WHERE c.sport_type = $1 AND c.is_active = true AND v.is_approved = true
      ORDER BY v.rating DESC, c.price_per_hour ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(selectQuery, [sportType, limit, offset]);
    return result.rows.map((row) => new Court(row));
  }

  // Check availability for a specific time slot
  async checkAvailability(date, startTime, endTime) {
    const availabilityQuery = `
      SELECT COUNT(*) as booking_count
      FROM bookings
      WHERE court_id = $1
        AND booking_date = $2
        AND status != 'cancelled'
        AND (
          (start_time <= $3 AND end_time > $3) OR
          (start_time < $4 AND end_time >= $4) OR
          (start_time >= $3 AND end_time <= $4)
        )
    `;

    const result = await query(availabilityQuery, [this.id, date, startTime, endTime]);
    return parseInt(result.rows[0].booking_count) === 0;
  }

  // Get available time slots for a specific date
  async getAvailableSlots(date) {
    const bookedSlotsQuery = `
      SELECT start_time, end_time
      FROM bookings
      WHERE court_id = $1
        AND booking_date = $2
        AND status != 'cancelled'
      ORDER BY start_time
    `;

    const result = await query(bookedSlotsQuery, [this.id, date]);

    // Generate available slots based on operating hours and booked slots
    const operatingHours = this.operatingHours || { start: '06:00', end: '22:00' };
    const availableSlots = [];

    // This is a simplified version - you might want to implement more sophisticated slot generation
    const startHour = parseInt(operatingHours.start.split(':')[0]);
    const endHour = parseInt(operatingHours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if this slot conflicts with any booking
      const isBooked = result.rows.some((booking) => {
        return slotStart < booking.end_time && slotEnd > booking.start_time;
      });

      if (!isBooked) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          price: this.pricePerHour,
        });
      }
    }

    return availableSlots;
  }

  // Update court
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
      UPDATE courts
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    return new Court(result.rows[0]);
  }

  // Deactivate court
  async deactivate() {
    return this.update({ isActive: false });
  }

  // Delete court
  async delete() {
    const deleteQuery = `DELETE FROM courts WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [this.id]);
    return result.rows.length > 0;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      venueId: this.venueId,
      name: this.name,
      sportType: this.sportType,
      pricePerHour: parseFloat(this.pricePerHour),
      operatingHours: this.operatingHours,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Court;
