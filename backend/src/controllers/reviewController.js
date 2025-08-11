import { validationResult } from 'express-validator';
import prisma from '../config/prisma.js';

// Create review (simplified)
export const createReview = async (req, res) => {
  try {
    const { bookingId, venueId, rating, comment } = req.body;
    const userId = req.user.id;
<<<<<<< HEAD
    const { venueId, bookingId, rating, comment } = req.body;
=======
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        userId: userId,
        venueId: parseInt(venueId),
        status: 'confirmed',
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not eligible for review',
      });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        venueId: parseInt(venueId),
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this venue',
      });
    }

    // Create review
<<<<<<< HEAD
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
=======
    const review = await prisma.review.create({
      data: {
        userId: userId,
        venueId: parseInt(venueId),
        bookingId: parseInt(bookingId),
        rating: parseInt(rating),
        comment: comment,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        venue: {
          select: {
            name: true,
          },
        },
      },
    });

    // Mark booking as reviewed
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { reviewed: true },
    });
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
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

// Update review (simplified)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userId: userId,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

<<<<<<< HEAD
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
=======
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        rating: parseInt(rating),
        comment: comment,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        venue: {
          select: {
            name: true,
          },
        },
      },
    });
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview,
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

// Delete review (simplified)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userId: userId,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) },
    });

    // Mark booking as not reviewed
    await prisma.booking.update({
      where: { id: review.bookingId },
      data: { reviewed: false },
    });

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

// Get venue reviews (simplified)
export const getVenueReviews = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { limit = 20, offset = 0, sortBy = 'newest' } = req.query;

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'highest_rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'lowest_rating') {
      orderBy = { rating: 'asc' };
    }

    const reviews = await prisma.review.findMany({
      where: { venueId: parseInt(venueId) },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: orderBy,
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.review.count({
      where: { venueId: parseInt(venueId) },
    });

<<<<<<< HEAD
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
=======
    // Get rating statistics
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: { venueId: parseInt(venueId) },
      _count: {
        rating: true,
      },
    });
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    const averageRating = await prisma.review.aggregate({
      where: { venueId: parseInt(venueId) },
      _avg: {
        rating: true,
      },
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < total,
        },
        stats: {
          average_rating: averageRating._avg.rating || 0,
          total_reviews: total,
          rating_distribution: ratingStats,
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

// Get user reviews (simplified)
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { userId: userId },
      include: {
        venue: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

<<<<<<< HEAD
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
=======
    const total = await prisma.review.count({
      where: { userId: userId },
    });
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < total,
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

// Mark review as helpful (simplified)
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user already marked this review as helpful
    const existingHelpful = await prisma.reviewHelpful.findFirst({
      where: {
        reviewId: parseInt(reviewId),
        userId: userId,
      },
    });

    if (existingHelpful) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful',
      });
    }

    // Create helpful record
    await prisma.reviewHelpful.create({
      data: {
        reviewId: parseInt(reviewId),
        userId: userId,
      },
    });

    // Update helpful count
    await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

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
