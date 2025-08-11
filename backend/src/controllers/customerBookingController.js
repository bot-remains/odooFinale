import Booking from '../models/Booking.js';
import Court from '../models/Court.js';
import Venue from '../models/Venue.js';
import { validationResult } from 'express-validator';

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate, limit = 20, offset = 0, upcoming = false } = req.query;

    // Build filters
    let whereClause = 'WHERE b.user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (startDate) {
      whereClause += ` AND b.booking_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereClause += ` AND b.booking_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    if (upcoming === 'true') {
      whereClause += ` AND (b.booking_date > CURRENT_DATE OR
        (b.booking_date = CURRENT_DATE AND b.start_time > CURRENT_TIME))`;
    }

    const { query } = await import('../config/database.js');

    const bookingsQuery = `
      SELECT
        b.*,
        c.name as court_name,
        c.sport_type,
        c.price_per_hour,
        v.name as venue_name,
        v.location as venue_location,
        v.contact_phone as venue_phone,
        v.contact_email as venue_email,
        u.name as owner_name
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      JOIN users u ON v.owner_id = u.id
      ${whereClause}
      ORDER BY b.booking_date DESC, b.start_time DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);
    const result = await query(bookingsQuery, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        bookings: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { courtId, bookingDate, startTime, endTime, notes, totalAmount } = req.body;

    // Verify court exists and is active
    const court = await Court.findById(courtId);
    if (!court || !court.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or not available',
      });
    }

    // Verify venue is approved
    const venue = await Venue.findById(court.venueId);
    if (!venue || !venue.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Venue not available for booking',
      });
    }

    // Check if booking date is not in the past
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
    if (bookingDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates and times',
      });
    }

    // Check availability
    const isAvailable = await court.checkAvailability(bookingDate, startTime, endTime);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'The requested time slot is not available',
      });
    }

    // Calculate total amount if not provided
    let finalAmount = totalAmount;
    if (!finalAmount) {
      const duration = calculateDuration(startTime, endTime);
      finalAmount = duration * court.pricePerHour;
    }

    // Create booking
    const bookingData = {
      userId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      totalAmount: finalAmount,
      notes: notes || '',
      status: 'pending', // Will be confirmed after payment
    };

    const booking = await Booking.create(bookingData);

    // Get full booking details for response
    const { query } = await import('../config/database.js');
    const bookingQuery = `
      SELECT
        b.*,
        c.name as court_name,
        c.sport_type,
        c.price_per_hour,
        v.name as venue_name,
        v.location as venue_location,
        v.contact_phone as venue_phone,
        v.contact_email as venue_email,
        u.name as owner_name,
        owner.email as owner_email
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      JOIN users u ON v.owner_id = u.id
      JOIN users owner ON v.owner_id = owner.id
      WHERE b.id = $1
    `;

    const result = await query(bookingQuery, [booking.id]);
    const bookingDetails = result.rows[0];

    // TODO: Send notification emails to customer and venue owner
    // TODO: Initiate payment process

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: bookingDetails,
        paymentRequired: true,
        paymentAmount: finalAmount,
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings',
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking',
      });
    }

    // Check cancellation policy (e.g., can't cancel within 2 hours of start time)
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilBooking < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 2 hours before start time',
      });
    }

    // Update booking status
    await booking.update({
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by customer',
      cancelledAt: new Date(),
    });

    // TODO: Process refund based on cancellation policy
    // TODO: Send cancellation notification to venue owner

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking.id,
        refundEligible: hoursUntilBooking >= 24, // Example: full refund if cancelled 24+ hours before
        refundAmount: hoursUntilBooking >= 24 ? booking.totalAmount : booking.totalAmount * 0.5,
      },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
};

// Reschedule a booking
export const rescheduleBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { bookingId } = req.params;
    const { newDate, newStartTime, newEndTime } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reschedule your own bookings',
      });
    }

    // Check if booking can be rescheduled
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed or pending bookings can be rescheduled',
      });
    }

    // Check if new date is not in the past
    const newBookingDateTime = new Date(`${newDate}T${newStartTime}`);
    if (newBookingDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to past dates and times',
      });
    }

    // Get court details
    const court = await Court.findById(booking.courtId);
    if (!court || !court.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Court not available',
      });
    }

    // Check availability for new time slot
    const isAvailable = await court.checkAvailability(newDate, newStartTime, newEndTime);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'The requested new time slot is not available',
      });
    }

    // Calculate new total amount
    const newDuration = calculateDuration(newStartTime, newEndTime);
    const newTotalAmount = newDuration * court.pricePerHour;

    // Update booking
    await booking.update({
      bookingDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      totalAmount: newTotalAmount,
      rescheduledAt: new Date(),
    });

    // TODO: Handle payment difference if price changed
    // TODO: Send reschedule notification to venue owner

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: {
        booking: await booking.reload(),
        priceDifference: newTotalAmount - booking.totalAmount,
      },
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error.message,
    });
  }
};

// Get booking details
export const getBookingDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const { query } = await import('../config/database.js');

    const bookingQuery = `
      SELECT
        b.*,
        c.name as court_name,
        c.sport_type,
        c.price_per_hour,
        c.description as court_description,
        v.name as venue_name,
        v.location as venue_location,
        v.address as venue_address,
        v.contact_phone as venue_phone,
        v.contact_email as venue_email,
        v.amenities as venue_amenities,
        u.name as owner_name,
        u.phone as owner_phone
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      JOIN users u ON v.owner_id = u.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const result = await query(bookingQuery, [bookingId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const booking = result.rows[0];

    // Check if booking allows reviews (completed and not already reviewed)
    const canReview = booking.status === 'completed' && !booking.reviewed;

    res.json({
      success: true,
      data: {
        booking,
        canCancel: ['confirmed', 'pending'].includes(booking.status),
        canReschedule: ['confirmed', 'pending'].includes(booking.status),
        canReview,
      },
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message,
    });
  }
};

// Helper function to calculate duration in hours
const calculateDuration = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return (end - start) / (1000 * 60 * 60);
};
