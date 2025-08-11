import { validationResult } from 'express-validator';
import Venue from '../models/Venue.js';

// Admin Dashboard - Get system statistics
export const getAdminDashboard = async (req, res) => {
  try {
    const { query } = await import('../config/database.js');

    // Get system statistics
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'facility_owner') as total_owners,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM venues) as total_venues,
        (SELECT COUNT(*) FROM venues WHERE is_approved = true) as approved_venues,
        (SELECT COUNT(*) FROM venues WHERE is_approved = false) as pending_venues,
        (SELECT COUNT(*) FROM courts WHERE is_active = true) as active_courts,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') as cancelled_bookings,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT SUM(total_amount) FROM bookings WHERE status = 'confirmed') as total_revenue
    `;

    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];

    // Get monthly booking trends (last 12 months)
    const trendQuery = `
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    const trendResult = await query(trendQuery);

    // Get recent activities
    const activitiesQuery = `
      (SELECT 'venue_created' as type, v.name as title, v.created_at as timestamp,
              u.name as user_name, 'venue' as entity_type, v.id as entity_id
       FROM venues v JOIN users u ON v.owner_id = u.id
       ORDER BY v.created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'booking_created' as type,
              CONCAT(v.name, ' - ', c.name) as title,
              b.created_at as timestamp,
              u.name as user_name, 'booking' as entity_type, b.id as entity_id
       FROM bookings b
       JOIN courts c ON b.court_id = c.id
       JOIN venues v ON c.venue_id = v.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'review_created' as type,
              CONCAT('Review for ', v.name) as title,
              r.created_at as timestamp,
              u.name as user_name, 'review' as entity_type, r.id as entity_id
       FROM reviews r
       JOIN venues v ON r.venue_id = v.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 15
    `;

    const activitiesResult = await query(activitiesQuery);

    // Get recent bookings (last 10)
    const recentBookingsQuery = `
      SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.total_amount,
        b.status,
        b.created_at,
        c.name as court_name,
        c.sport_type,
        v.name as venue_name,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `;

    const recentBookingsResult = await query(recentBookingsQuery);

    // Get top venues by booking count
    const topVenuesQuery = `
      SELECT 
        v.id,
        v.name,
        v.location,
        COUNT(b.id) as booking_count,
        AVG(v.rating) as avg_rating,
        SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as total_revenue
      FROM venues v
      LEFT JOIN courts c ON v.id = c.venue_id
      LEFT JOIN bookings b ON c.id = b.court_id
      WHERE v.is_approved = true
      GROUP BY v.id, v.name, v.location
      ORDER BY booking_count DESC
      LIMIT 5
    `;

    const topVenuesResult = await query(topVenuesQuery);

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          total_revenue: parseFloat(stats.total_revenue || 0),
        },
        trends: trendResult.rows,
        recentActivities: activitiesResult.rows,
        recentBookings: recentBookingsResult.rows,
        topVenues: topVenuesResult.rows,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

// Get all venues for admin review
export const getAllVenuesForReview = async (req, res) => {
  try {
    const {
      status = 'pending',
      search,
      location,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = req.query;

    const { query } = await import('../config/database.js');

    // Build filters
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status === 'pending') {
      whereClause += ` AND v.is_approved = false`;
    } else if (status === 'approved') {
      whereClause += ` AND v.is_approved = true`;
    }

    if (search) {
      whereClause += ` AND (v.name ILIKE $${paramCount} OR v.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (location) {
      whereClause += ` AND v.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    // Determine sort order
    const validSortFields = ['created_at', 'name', 'location', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    params.push(limit, offset);

    const venuesQuery = `
      SELECT
        v.*,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(DISTINCT c.id) as courts_count,
        COUNT(DISTINCT b.id) as total_bookings,
        AVG(c.price_per_hour) as avg_price
      FROM venues v
      JOIN users u ON v.owner_id = u.id
      LEFT JOIN courts c ON v.id = c.venue_id
      LEFT JOIN bookings b ON c.id = b.court_id
      ${whereClause}
      GROUP BY v.id, u.name, u.email
      ORDER BY v.${sortField} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const venuesResult = await query(venuesQuery, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM venues v
      JOIN users u ON v.owner_id = u.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        venues: venuesResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    console.error('Get venues for review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues',
      error: error.message,
    });
  }
};

// Approve or reject a venue
export const reviewVenue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { venueId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    if (venue.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Venue is already approved',
      });
    }

    if (action === 'approve') {
      await venue.update({
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: req.user.id,
      });

      // TODO: Send approval notification to venue owner

      res.json({
        success: true,
        message: 'Venue approved successfully',
        data: venue.toJSON(),
      });
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }

      await venue.update({
        rejectionReason,
        rejectedAt: new Date(),
        rejectedBy: req.user.id,
      });

      // TODO: Send rejection notification to venue owner

      res.json({
        success: true,
        message: 'Venue rejected successfully',
        data: { venueId, rejectionReason },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"',
      });
    }
  } catch (error) {
    console.error('Review venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review venue',
      error: error.message,
    });
  }
};

// Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      search,
      status = 'active',
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = req.query;

    const { query } = await import('../config/database.js');

    // Build filters
    let whereClause = "WHERE u.role != 'admin'"; // Don't show admin users
    const params = [];
    let paramCount = 1;

    if (role) {
      whereClause += ` AND u.role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      whereClause += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status === 'active') {
      whereClause += ` AND u.is_active = true`;
    } else if (status === 'inactive') {
      whereClause += ` AND u.is_active = false`;
    }

    // Determine sort order
    const validSortFields = ['created_at', 'name', 'email', 'last_login'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    params.push(limit, offset);

    const usersQuery = `
      SELECT
        u.*,
        CASE
          WHEN u.role = 'facility_owner' THEN (
            SELECT COUNT(*) FROM venues v WHERE v.owner_id = u.id
          )
          ELSE NULL
        END as venues_count,
        CASE
          WHEN u.role = 'user' THEN (
            SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id
          )
          ELSE NULL
        END as bookings_count
      FROM users u
      ${whereClause}
      ORDER BY u.${sortField} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const usersResult = await query(usersQuery, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;
    const countResult = await query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        users: usersResult.rows.map((user) => ({
          ...user,
          password: undefined, // Don't send password hash
        })),
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// Suspend or activate a user
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'suspend' or 'activate'

    const { query } = await import('../config/database.js');

    // Check if user exists
    const userCheck = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userCheck.rows[0];

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin users',
      });
    }

    if (action === 'suspend') {
      await query(
        'UPDATE users SET is_active = false, suspended_at = $1, suspension_reason = $2 WHERE id = $3',
        [new Date(), reason || 'Suspended by admin', userId]
      );

      // TODO: Send suspension notification to user

      res.json({
        success: true,
        message: 'User suspended successfully',
      });
    } else if (action === 'activate') {
      await query(
        'UPDATE users SET is_active = true, suspended_at = NULL, suspension_reason = NULL WHERE id = $1',
        [userId]
      );

      // TODO: Send activation notification to user

      res.json({
        success: true,
        message: 'User activated successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "suspend" or "activate"',
      });
    }
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

// Get system reports
export const getSystemReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const { query } = await import('../config/database.js');

    let reportData = {};

    switch (reportType) {
      case 'bookings':
        const bookingsQuery = `
          SELECT
            DATE(b.created_at) as date,
            COUNT(*) as total_bookings,
            COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
            COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
            SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as revenue
          FROM bookings b
          WHERE ($1::date IS NULL OR b.created_at >= $1::date)
            AND ($2::date IS NULL OR b.created_at <= $2::date)
          GROUP BY DATE(b.created_at)
          ORDER BY date DESC
        `;
        const bookingsResult = await query(bookingsQuery, [startDate, endDate]);
        reportData.bookings = bookingsResult.rows;
        break;

      case 'venues':
        const venuesQuery = `
          SELECT
            DATE(v.created_at) as date,
            COUNT(*) as new_venues,
            COUNT(CASE WHEN v.is_approved THEN 1 END) as approved_venues,
            v.location,
            COUNT(*) OVER (PARTITION BY v.location) as venues_by_location
          FROM venues v
          WHERE ($1::date IS NULL OR v.created_at >= $1::date)
            AND ($2::date IS NULL OR v.created_at <= $2::date)
          GROUP BY DATE(v.created_at), v.location
          ORDER BY date DESC
        `;
        const venuesResult = await query(venuesQuery, [startDate, endDate]);
        reportData.venues = venuesResult.rows;
        break;

      case 'revenue':
        const revenueQuery = `
          SELECT
            DATE_TRUNC('month', b.created_at) as month,
            SUM(b.total_amount) as total_revenue,
            COUNT(*) as total_bookings,
            AVG(b.total_amount) as avg_booking_value,
            c.sport_type,
            v.location
          FROM bookings b
          JOIN courts c ON b.court_id = c.id
          JOIN venues v ON c.venue_id = v.id
          WHERE b.status = 'confirmed'
            AND ($1::date IS NULL OR b.created_at >= $1::date)
            AND ($2::date IS NULL OR b.created_at <= $2::date)
          GROUP BY DATE_TRUNC('month', b.created_at), c.sport_type, v.location
          ORDER BY month DESC
        `;
        const revenueResult = await query(revenueQuery, [startDate, endDate]);
        reportData.revenue = revenueResult.rows;
        break;

      case 'users':
        const usersQuery = `
          SELECT
            DATE(u.created_at) as date,
            COUNT(*) as new_users,
            COUNT(CASE WHEN u.role = 'user' THEN 1 END) as new_customers,
            COUNT(CASE WHEN u.role = 'facility_owner' THEN 1 END) as new_owners,
            COUNT(CASE WHEN u.is_active THEN 1 END) as active_users
          FROM users u
          WHERE u.role != 'admin'
            AND ($1::date IS NULL OR u.created_at >= $1::date)
            AND ($2::date IS NULL OR u.created_at <= $2::date)
          GROUP BY DATE(u.created_at)
          ORDER BY date DESC
        `;
        const usersResult = await query(usersQuery, [startDate, endDate]);
        reportData.users = usersResult.rows;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Available types: bookings, venues, revenue, users',
        });
    }

    res.json({
      success: true,
      data: {
        reportType,
        dateRange: { startDate, endDate },
        ...reportData,
      },
    });
  } catch (error) {
    console.error('Get system reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message,
    });
  }
};
