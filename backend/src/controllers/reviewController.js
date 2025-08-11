import { validationResult } from 'express-validator';

// Create a review for a venue
export const createReview = async (req, res) => {
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
    const { venueId, bookingId, rating, comment } = req.body;

    // Verify user has a completed booking at this venue
    const { query } = await import('../config/database.js');

    const bookingCheck = `
      SELECT b.id, b.status, b.reviewed
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.id = $1 AND b.user_id = $2 AND c.venue_id = $3 AND b.status = 'completed'
    `;

    const bookingResult = await query(bookingCheck, [bookingId, userId, venueId]);

    if (bookingResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You can only review venues where you have completed bookings',
      });
    }

    const booking = bookingResult.rows[0];
    if (booking.reviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    // Check if user already reviewed this venue
    const existingReviewQuery = `
      SELECT id FROM reviews
      WHERE user_id = $1 AND venue_id = $2
    `;
    const existingReview = await query(existingReviewQuery, [userId, venueId]);

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this venue',
      });
    }

    // Create review
    const reviewData = {
      user_id: userId,
      venue_id: venueId,
      booking_id: bookingId,
      rating: rating,
      comment: comment || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const insertQuery = `
      INSERT INTO reviews (user_id, venue_id, booking_id, rating, comment, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const reviewResult = await query(insertQuery, [
      reviewData.user_id,
      reviewData.venue_id,
      reviewData.booking_id,
      reviewData.rating,
      reviewData.comment,
      reviewData.created_at,
      reviewData.updated_at,
    ]);

    const review = reviewResult.rows[0];

    // Mark booking as reviewed
    await query('UPDATE bookings SET reviewed = true WHERE id = $1', [bookingId]);

    // Update venue rating
    await updateVenueRating(venueId);

    // Get complete review details for response
    const reviewDetailsQuery = `
      SELECT
        r.*,
        u.name as user_name,
        u.avatar as user_avatar,
        v.name as venue_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN venues v ON r.venue_id = v.id
      WHERE r.id = $1
    `;

    const detailsResult = await query(reviewDetailsQuery, [review.id]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: detailsResult.rows[0],
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
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
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const { query } = await import('../config/database.js');

    // Check if review exists and belongs to user
    const reviewCheck = await query('SELECT * FROM reviews WHERE id = $1 AND user_id = $2', [
      reviewId,
      userId,
    ]);

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to update it',
      });
    }

    const existingReview = reviewCheck.rows[0];

    // Check if review can be updated (within 30 days)
    const reviewDate = new Date(existingReview.created_at);
    const now = new Date();
    const daysSinceReview = (now - reviewDate) / (1000 * 60 * 60 * 24);

    if (daysSinceReview > 30) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be updated within 30 days of creation',
      });
    }

    // Update review
    const updateQuery = `
      UPDATE reviews
      SET rating = $1, comment = $2, updated_at = $3
      WHERE id = $4
      RETURNING *
    `;

    const updateResult = await query(updateQuery, [
      rating,
      comment || existingReview.comment,
      new Date(),
      reviewId,
    ]);

    // Update venue rating if rating changed
    if (rating !== existingReview.rating) {
      await updateVenueRating(existingReview.venue_id);
    }

    // Get complete review details for response
    const reviewDetailsQuery = `
      SELECT
        r.*,
        u.name as user_name,
        u.avatar as user_avatar,
        v.name as venue_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN venues v ON r.venue_id = v.id
      WHERE r.id = $1
    `;

    const detailsResult = await query(reviewDetailsQuery, [reviewId]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: detailsResult.rows[0],
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const { query } = await import('../config/database.js');

    // Check if review exists and belongs to user
    const reviewCheck = await query('SELECT * FROM reviews WHERE id = $1 AND user_id = $2', [
      reviewId,
      userId,
    ]);

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it',
      });
    }

    const review = reviewCheck.rows[0];

    // Delete review
    await query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    // Update venue rating
    await updateVenueRating(review.venue_id);

    // Mark booking as not reviewed
    await query('UPDATE bookings SET reviewed = false WHERE id = $1', [review.booking_id]);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

// Get reviews for a venue
export const getVenueReviews = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { rating, sortBy = 'created_at', sortOrder = 'desc', limit = 20, offset = 0 } = req.query;

    const { query } = await import('../config/database.js');

    // Build filters
    let whereClause = 'WHERE r.venue_id = $1';
    const params = [venueId];
    let paramCount = 2;

    if (rating) {
      whereClause += ` AND r.rating = $${paramCount}`;
      params.push(rating);
      paramCount++;
    }

    // Determine sort order
    let orderClause = 'ORDER BY r.created_at DESC';
    if (sortBy === 'rating') {
      orderClause = `ORDER BY r.rating ${sortOrder.toUpperCase()}, r.created_at DESC`;
    } else if (sortBy === 'helpful') {
      orderClause = `ORDER BY r.helpful_count ${sortOrder.toUpperCase()}, r.created_at DESC`;
    }

    params.push(limit, offset);

    const reviewsQuery = `
      SELECT
        r.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ${orderClause}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const reviewsResult = await query(reviewsQuery, params);

    // Get total count and rating distribution
    const statsQuery = `
      SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews r
      ${whereClause.replace(/LIMIT.*|OFFSET.*/, '')}
    `;

    const statsResult = await query(statsQuery, params.slice(0, -2));
    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        reviews: reviewsResult.rows,
        stats: {
          totalReviews: parseInt(stats.total_reviews),
          averageRating: parseFloat(stats.avg_rating || 0).toFixed(1),
          ratingDistribution: {
            5: parseInt(stats.five_star),
            4: parseInt(stats.four_star),
            3: parseInt(stats.three_star),
            2: parseInt(stats.two_star),
            1: parseInt(stats.one_star),
          },
        },
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < parseInt(stats.total_reviews),
        },
      },
    });
  } catch (error) {
    console.error('Get venue reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const { query } = await import('../config/database.js');

    const reviewsQuery = `
      SELECT
        r.*,
        v.name as venue_name,
        v.location as venue_location
      FROM reviews r
      JOIN venues v ON r.venue_id = v.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const reviewsResult = await query(reviewsQuery, [userId, limit, offset]);

    // Get total count
    const countResult = await query('SELECT COUNT(*) as total FROM reviews WHERE user_id = $1', [
      userId,
    ]);

    res.json({
      success: true,
      data: {
        reviews: reviewsResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews',
      error: error.message,
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const { query } = await import('../config/database.js');

    // Check if review exists
    const reviewCheck = await query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user already marked this review as helpful
    const helpfulCheck = await query(
      'SELECT * FROM review_helpful WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (helpfulCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful',
      });
    }

    // Add helpful mark
    await query('INSERT INTO review_helpful (review_id, user_id, created_at) VALUES ($1, $2, $3)', [
      reviewId,
      userId,
      new Date(),
    ]);

    // Update helpful count
    await query('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1', [reviewId]);

    res.json({
      success: true,
      message: 'Review marked as helpful',
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message,
    });
  }
};

// Helper function to update venue rating
const updateVenueRating = async (venueId) => {
  try {
    const { query } = await import('../config/database.js');

    const ratingQuery = `
      SELECT
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews
      FROM reviews
      WHERE venue_id = $1
    `;

    const result = await query(ratingQuery, [venueId]);
    const { avg_rating, total_reviews } = result.rows[0];

    await query('UPDATE venues SET rating = $1, total_reviews = $2 WHERE id = $3', [
      avg_rating || 0,
      total_reviews || 0,
      venueId,
    ]);
  } catch (error) {
    console.error('Update venue rating error:', error);
    // Don't throw error to avoid breaking the main operation
  }
};
