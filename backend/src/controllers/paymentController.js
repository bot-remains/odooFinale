import { validationResult } from 'express-validator';

// Create payment intent (for Stripe integration)
export const createPaymentIntent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { bookingId, amount } = req.body;
    const userId = req.user.id;

    // Verify booking exists and belongs to user
    const { query } = await import('../config/database.js');

    const bookingQuery = `
      SELECT b.*, c.name as court_name, v.name as venue_name
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      WHERE b.id = $1 AND b.user_id = $2 AND b.status = 'pending'
    `;

    const bookingResult = await query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or cannot be paid',
      });
    }

    const booking = bookingResult.rows[0];

    // TODO: Integrate with Stripe or other payment gateway
    // For now, we'll simulate payment processing

    // Simulate payment intent creation
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Convert to cents for Stripe
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      booking_id: bookingId,
      created_at: new Date(),
    };

    // Store payment intent in database
    const paymentQuery = `
      INSERT INTO payment_intents (id, booking_id, amount, currency, status, client_secret, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    await query(paymentQuery, [
      paymentIntent.id,
      bookingId,
      paymentIntent.amount,
      paymentIntent.currency,
      paymentIntent.status,
      paymentIntent.client_secret,
      paymentIntent.created_at,
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        booking: {
          id: booking.id,
          venue_name: booking.venue_name,
          court_name: booking.court_name,
          booking_date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
        },
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    const { query } = await import('../config/database.js');

    // Get payment intent and associated booking
    const paymentQuery = `
      SELECT pi.*, b.user_id, b.id as booking_id
      FROM payment_intents pi
      JOIN bookings b ON pi.booking_id = b.id
      WHERE pi.id = $1 AND b.user_id = $2
    `;

    const paymentResult = await query(paymentQuery, [paymentIntentId, userId]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found',
      });
    }

    const payment = paymentResult.rows[0];

    // TODO: Verify payment with payment gateway
    // For now, we'll simulate successful payment

    // Update payment status
    await query('UPDATE payment_intents SET status = $1, paid_at = $2 WHERE id = $3', [
      'succeeded',
      new Date(),
      paymentIntentId,
    ]);

    // Update booking status to confirmed
    await query('UPDATE bookings SET status = $1, confirmed_at = $2 WHERE id = $3', [
      'confirmed',
      new Date(),
      payment.booking_id,
    ]);

    // TODO: Send confirmation notifications

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        paymentIntentId,
        bookingId: payment.booking_id,
        status: 'confirmed',
      },
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const { query } = await import('../config/database.js');

    const paymentsQuery = `
      SELECT
        pi.*,
        b.booking_date,
        b.start_time,
        b.end_time,
        c.name as court_name,
        v.name as venue_name
      FROM payment_intents pi
      JOIN bookings b ON pi.booking_id = b.id
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      WHERE b.user_id = $1
      ORDER BY pi.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const paymentsResult = await query(paymentsQuery, [userId, limit, offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM payment_intents pi
      JOIN bookings b ON pi.booking_id = b.id
      WHERE b.user_id = $1
    `;
    const countResult = await query(countQuery, [userId]);

    res.json({
      success: true,
      data: {
        payments: paymentsResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason, amount } = req.body;
    const userId = req.user.id;

    const { query } = await import('../config/database.js');

    // Get booking and payment details
    const bookingQuery = `
      SELECT b.*, pi.id as payment_intent_id, pi.amount as paid_amount
      FROM bookings b
      JOIN payment_intents pi ON b.id = pi.booking_id
      WHERE b.id = $1 AND b.user_id = $2 AND b.status = 'cancelled'
    `;

    const bookingResult = await query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not eligible for refund',
      });
    }

    const booking = bookingResult.rows[0];

    // Check if refund already exists
    const existingRefundQuery = `
      SELECT id FROM refunds WHERE booking_id = $1
    `;
    const existingRefund = await query(existingRefundQuery, [bookingId]);

    if (existingRefund.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Refund already processed for this booking',
      });
    }

    // Calculate refund amount based on cancellation policy
    const refundAmount = amount || calculateRefundAmount(booking);

    // TODO: Process refund with payment gateway
    // For now, we'll simulate refund processing

    // Create refund record
    const refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const refundQuery = `
      INSERT INTO refunds (id, booking_id, payment_intent_id, amount, reason, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const refundResult = await query(refundQuery, [
      refundId,
      bookingId,
      booking.payment_intent_id,
      refundAmount,
      reason || 'Booking cancellation',
      'succeeded',
      new Date(),
    ]);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: refundResult.rows[0],
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};

// Helper function to calculate refund amount based on cancellation policy
const calculateRefundAmount = (booking) => {
  const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
  const cancelledAt = new Date(booking.cancelled_at);
  const hoursUntilBooking = (bookingDateTime - cancelledAt) / (1000 * 60 * 60);

  if (hoursUntilBooking >= 24) {
    return booking.total_amount; // 100% refund if cancelled 24+ hours before
  } else if (hoursUntilBooking >= 2) {
    return booking.total_amount * 0.5; // 50% refund if cancelled 2-24 hours before
  } else {
    return 0; // No refund if cancelled less than 2 hours before
  }
};
