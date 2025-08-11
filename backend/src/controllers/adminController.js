import { validationResult } from 'express-validator';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Court from '../models/Court.js';
import Review from '../models/Review.js';
import prisma from '../config/prisma.js';

// Admin Dashboard - Get system statistics
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalOwners,
      totalVenues,
      approvedVenues,
      pendingVenues,
      activeCourts,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalReviews,
      revenueResult,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.user.count({ where: { role: 'facility_owner' } }),
      prisma.venue.count(),
      prisma.venue.count({ where: { isApproved: true } }),
      prisma.venue.count({ where: { isApproved: false } }),
      prisma.court.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.review.count(),
      prisma.booking.aggregate({
        where: { status: 'confirmed' },
        _sum: { totalAmount: true },
      }),
    ]);

<<<<<<< HEAD
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
=======
    const stats = {
      total_customers: totalCustomers,
      total_owners: totalOwners,
      total_venues: totalVenues,
      approved_venues: approvedVenues,
      pending_venues: pendingVenues,
      active_courts: activeCourts,
      total_bookings: totalBookings,
      confirmed_bookings: confirmedBookings,
      pending_bookings: pendingBookings,
      cancelled_bookings: cancelledBookings,
      total_reviews: totalReviews,
      total_revenue: revenueResult._sum.totalAmount || 0,
    };
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    // Get monthly booking trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Get monthly booking trends (simplified)
    const monthlyTrends = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1), // Current year
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Simple trend data
    const trendResult = [
      {
        month: new Date(),
        bookings: totalBookings,
        revenue: totalRevenue,
      },
    ];

    // Get recent activities
    const [recentVenues, recentBookings] = await Promise.all([
      prisma.venue.findMany({
        include: {
          owner: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.booking.findMany({
        include: {
          venue: { select: { name: true } },
          court: { select: { name: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Format activities
    const activities = [
      ...recentVenues.map((venue) => ({
        type: 'venue_created',
        title: venue.name,
        timestamp: venue.createdAt,
        user_name: venue.owner.name,
        entity_type: 'venue',
        entity_id: venue.id,
      })),
      ...recentBookings.map((booking) => ({
        type: 'booking_created',
        title: `${booking.venue.name} - ${booking.court.name}`,
        timestamp: booking.createdAt,
        user_name: booking.user.name,
        entity_type: 'booking',
        entity_id: booking.id,
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

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
<<<<<<< HEAD
        trends: trendResult.rows,
        recentActivities: activitiesResult.rows,
        recentBookings: recentBookingsResult.rows,
        topVenues: topVenuesResult.rows,
=======
        trends: trendResult,
        recentActivities: activities,
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
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

    // Build where conditions
    const whereConditions = {};

    if (status === 'pending') {
      whereConditions.isApproved = false;
    } else if (status === 'approved') {
      whereConditions.isApproved = true;
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      whereConditions.location = { contains: location, mode: 'insensitive' };
    }

    // Determine sort order
    const validSortFields = ['createdAt', 'name', 'location'];
    const sortField =
      sortBy === 'created_at'
        ? 'createdAt'
        : validSortFields.includes(sortBy)
          ? sortBy
          : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const orderBy = { [sortField]: order };

    // Get venues with aggregated data
    const venues = await prisma.venue.findMany({
      where: whereConditions,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        courts: {
          select: {
            id: true,
            pricePerHour: true,
            _count: {
              select: {
                bookings: true,
              },
            },
          },
        },
        _count: {
          select: {
            courts: true,
          },
        },
      },
      orderBy,
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Transform data to match expected format
    const transformedVenues = venues.map((venue) => ({
      ...venue,
      owner_name: venue.owner.name,
      owner_email: venue.owner.email,
      courts_count: venue._count.courts,
      total_bookings: venue.courts.length > 0 ? venue.courts[0]._count.bookings || 0 : 0,
      avg_price: venue.courts.length > 0 ? parseFloat(venue.courts[0].pricePerHour || 0) : 0,
    }));

    // Get total count
    const total = await prisma.venue.count({
      where: whereConditions,
    });

    res.json({
      success: true,
      data: {
        venues: transformedVenues,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < total,
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

// Get all users with filters (converted to Prisma)
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      search,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = req.query;

    // Build where clause
    let whereClause = {
      role: { not: 'admin' }, // Don't show admin users
    };

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    // Build sort order
    const validSortFields = ['createdAt', 'name', 'email', 'lastLogin'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            venues: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        [sortField]: order,
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.user.count({
      where: whereClause,
    });

    res.json({
      success: true,
      data: {
        users: users.map((user) => ({
          ...user,
          password: undefined, // Don't send password hash
          venuesCount: user._count.venues,
          bookingsCount: user._count.bookings,
          _count: undefined, // Remove the _count object
        })),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < total,
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

// Suspend or activate a user (converted to Prisma)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'suspend' or 'activate'

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin users',
      });
    }

    if (action === 'suspend') {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isActive: false,
          suspendedAt: new Date(),
          suspensionReason: reason || 'Suspended by admin',
        },
      });

      res.json({
        success: true,
        message: 'User suspended successfully',
      });
    } else if (action === 'activate') {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isActive: true,
          suspendedAt: null,
          suspensionReason: null,
        },
      });

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

// Get system reports (simplified)
export const getSystemReports = async (req, res) => {
  try {
    const { reportType } = req.query;

    let reportData = {};

    switch (reportType) {
      case 'bookings':
        const [totalBookings, confirmedBookings, revenue] = await Promise.all([
          prisma.booking.count(),
          prisma.booking.count({ where: { status: 'confirmed' } }),
          prisma.booking.aggregate({
            where: { status: 'confirmed' },
            _sum: { totalAmount: true },
          }),
        ]);

        reportData = {
          total_bookings: totalBookings,
          confirmed_bookings: confirmedBookings,
          total_revenue: revenue._sum.totalAmount || 0,
        };
        break;

      case 'venues':
        const [totalVenues, approvedVenues] = await Promise.all([
          prisma.venue.count(),
          prisma.venue.count({ where: { isApproved: true } }),
        ]);

        reportData = {
          total_venues: totalVenues,
          approved_venues: approvedVenues,
        };
        break;

      case 'users':
        const [totalUsers, customers, owners] = await Promise.all([
          prisma.user.count({ where: { role: { not: 'admin' } } }),
          prisma.user.count({ where: { role: 'customer' } }),
          prisma.user.count({ where: { role: 'facility_owner' } }),
        ]);

        reportData = {
          total_users: totalUsers,
          customers: customers,
          facility_owners: owners,
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }

    res.json({
      success: true,
      data: reportData,
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
