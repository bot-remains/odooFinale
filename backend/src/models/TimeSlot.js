import { query } from '../config/database.js';

class TimeSlot {
  constructor(timeSlotData) {
    this.id = timeSlotData.id;
    this.courtId = timeSlotData.court_id;
    this.date = timeSlotData.date;
    this.startTime = timeSlotData.start_time;
    this.endTime = timeSlotData.end_time;
    this.isBlocked = timeSlotData.is_blocked;
    this.blockReason = timeSlotData.block_reason;
    this.price = timeSlotData.price;
    this.createdAt = timeSlotData.created_at;
    this.updatedAt = timeSlotData.updated_at;
  }

  // Create time_slots table for managing availability and maintenance blocks
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        court_id INTEGER REFERENCES courts(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_blocked BOOLEAN DEFAULT false,
        block_reason VARCHAR(255),
        price DECIMAL(10,2), -- Override default court price if needed
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_time_slots_court_id ON time_slots(court_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
      CREATE INDEX IF NOT EXISTS idx_time_slots_blocked ON time_slots(is_blocked);

      -- Ensure no overlapping time slots for same court on same date
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_time_slot
      ON time_slots(court_id, date, start_time, end_time);

      -- Create trigger to update updated_at
      CREATE OR REPLACE FUNCTION update_time_slots_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_time_slots_updated_at ON time_slots;
      CREATE TRIGGER update_time_slots_updated_at
          BEFORE UPDATE ON time_slots
          FOR EACH ROW
          EXECUTE FUNCTION update_time_slots_updated_at();
    `;

    try {
      await query(createTableQuery);
      console.log('✅ TimeSlots table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating time_slots table:', error.message);
      throw error;
    }
  }

  // Block a time slot for maintenance
  static async blockSlot(courtId, date, startTime, endTime, reason) {
    const insertQuery = `
      INSERT INTO time_slots (court_id, date, start_time, end_time, is_blocked, block_reason)
      VALUES ($1, $2, $3, $4, true, $5)
      ON CONFLICT (court_id, date, start_time, end_time)
      DO UPDATE SET is_blocked = true, block_reason = $5
      RETURNING *
    `;

    const result = await query(insertQuery, [courtId, date, startTime, endTime, reason]);
    return new TimeSlot(result.rows[0]);
  }

  // Unblock a time slot
  static async unblockSlot(courtId, date, startTime, endTime) {
    const updateQuery = `
      UPDATE time_slots
      SET is_blocked = false, block_reason = NULL
      WHERE court_id = $1 AND date = $2 AND start_time = $3 AND end_time = $4
      RETURNING *
    `;

    const result = await query(updateQuery, [courtId, date, startTime, endTime]);
    return result.rows.length > 0 ? new TimeSlot(result.rows[0]) : null;
  }

  // Get blocked slots for a court on a specific date
  static async getBlockedSlots(courtId, date) {
    const selectQuery = `
      SELECT * FROM time_slots
      WHERE court_id = $1 AND date = $2 AND is_blocked = true
      ORDER BY start_time
    `;

    const result = await query(selectQuery, [courtId, date]);
    return result.rows.map((row) => new TimeSlot(row));
  }

  // Check if a time slot is blocked
  static async isSlotBlocked(courtId, date, startTime, endTime) {
    const checkQuery = `
      SELECT COUNT(*) as blocked_count
      FROM time_slots
      WHERE court_id = $1
        AND date = $2
        AND is_blocked = true
        AND (
          (start_time <= $3 AND end_time > $3) OR
          (start_time < $4 AND end_time >= $4) OR
          (start_time >= $3 AND end_time <= $4)
        )
    `;

    const result = await query(checkQuery, [courtId, date, startTime, endTime]);
    return parseInt(result.rows[0].blocked_count) > 0;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      courtId: this.courtId,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      isBlocked: this.isBlocked,
      blockReason: this.blockReason,
      price: this.price ? parseFloat(this.price) : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default TimeSlot;
