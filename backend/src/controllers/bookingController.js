import Booking from '../models/Booking.js';

// Get bookings for venue owner's venues
export const getBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      status,
      venueId,
      courtId,
      date,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = req.query;

    const { query } = await import('../config/database.js');

    let whereClause = 'WHERE v.owner_id = $1';
    const params = [ownerId];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (venueId) {
      whereClause += ` AND v.id = $${paramCount}`;
      params.push(venueId);
      paramCount++;
    }

    if (courtId) {
      whereClause += ` AND c.id = $${paramCount}`;
      params.push(courtId);
      paramCount++;
    }

    if (date) {
      whereClause += ` AND b.booking_date = $${paramCount}`;
      params.push(date);
      paramCount++;
    } else if (startDate && endDate) {
      whereClause += ` AND b.booking_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(startDate, endDate);
      paramCount += 2;
    }

    params.push(limit, offset);

    const bookingsQuery = `
      SELECT
        b.*,
        c.name as court_name,
        c.sport_type,
        v.name as venue_name,
        u.name as user_name,
        u.email as user_email,
        u.id as user_id
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      JOIN users u ON b.user_id = u.id
      ${whereClause}
      ORDER BY b.booking_date DESC, b.start_time DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(bookingsQuery, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

// Update booking status (approve/reject)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed or cancelled',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership through venue
    const { query } = await import('../config/database.js');
    const ownershipQuery = `
      SELECT v.owner_id
      FROM venues v
      JOIN courts c ON v.id = c.venue_id
      WHERE c.id = $1
    `;
    const ownershipResult = await query(ownershipQuery, [booking.courtId]);

    if (ownershipResult.rows.length === 0 || ownershipResult.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const updatedBooking = await booking.update({
      status,
      cancelReason: status === 'cancelled' ? reason : null,
    });

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking.toJSON(),
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message,
    });
  }
};
