import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import prisma from '../config/prisma.js';
import { validationResult } from 'express-validator';

// Helper function to get venue statistics
const getVenueStats = async (ownerId) => {
  try {
    // Get venue counts
    const totalVenues = await prisma.venue.count({
      where: { ownerId: ownerId },
    });

    const approvedVenues = await prisma.venue.count({
      where: {
        ownerId: ownerId,
        isApproved: true,
      },
    });

    const pendingVenues = await prisma.venue.count({
      where: {
        ownerId: ownerId,
        isApproved: false,
      },
    });

    // Get court counts
    const totalCourts = await prisma.court.count({
      where: {
        venue: { ownerId: ownerId },
      },
    });

    const activeCourts = await prisma.court.count({
      where: {
        venue: { ownerId: ownerId },
        isActive: true,
      },
    });

    // Get booking statistics
    const bookingStats = await prisma.booking.aggregate({
      where: {
        venue: { ownerId: ownerId },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const confirmedBookings = await prisma.booking.count({
      where: {
        venue: { ownerId: ownerId },
        status: 'confirmed',
      },
    });

    return {
      total_venues: totalVenues,
      total_courts: totalCourts,
      approved_venues: approvedVenues,
      pending_venues: pendingVenues,
      active_courts: activeCourts,
      total_bookings: bookingStats._count.id || 0,
      confirmed_bookings: confirmedBookings,
      total_revenue: bookingStats._sum.totalAmount || 0,
    };
  } catch (error) {
    console.error('Error getting venue stats:', error);
    throw error;
  }
};

// Helper function to get recent bookings
const getRecentBookings = async (ownerId, limit = 10) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        venue: { ownerId: ownerId },
      },
      include: {
        court: {
          select: {
            name: true,
            sportType: true,
          },
        },
        venue: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
    });

    // Transform to match expected format
    return bookings.map((booking) => ({
      ...booking,
      court_name: booking.court.name,
      sport_type: booking.court.sportType,
      venue_name: booking.venue.name,
      user_name: booking.user.name,
      user_email: booking.user.email,
    }));
  } catch (error) {
    console.error('Error getting recent bookings:', error);
    throw error;
  }
};

// Helper function to get revenue data (simplified)
const getRevenueData = async (ownerId) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total revenue and count for last 30 days
    const revenueStats = await prisma.booking.aggregate({
      where: {
        venue: { ownerId: ownerId },
        status: 'confirmed',
        bookingDate: { gte: thirtyDaysAgo },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    return {
      total_revenue: revenueStats._sum.totalAmount || 0,
      total_bookings: revenueStats._count.id || 0,
      period: '30 days',
    };
  } catch (error) {
    console.error('Error getting revenue data:', error);
    throw error;
  }
};

// Get dashboard statistics
export const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get venue statistics
    const venueStats = await getVenueStats(ownerId);

    // Get recent bookings
    const recentBookings = await getRecentBookings(ownerId, 10);

    // Get revenue data for current month
    const revenueData = await getRevenueData(ownerId);

    res.json({
      success: true,
      data: {
        stats: venueStats,
        recentBookings,
        revenue: revenueData,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

// Get all venues owned by the user
export const getVenues = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const venues = await Venue.findByOwner(ownerId);

    // Get courts count for each venue
    const venuesWithCourts = await Promise.all(
      venues.map(async (venue) => {
        const courts = await Court.findByVenue(venue.id);
        return {
          ...venue.toJSON(),
          courtsCount: courts.length,
          courts: courts.map((court) => court.toJSON()),
        };
      })
    );

    res.json({
      success: true,
      data: venuesWithCourts,
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues',
      error: error.message,
    });
  }
};

// Create a new venue
export const createVenue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { courts, ...venueFields } = req.body;

    const venueData = {
      ...venueFields,
      ownerId: req.user.id,
    };

    // Create venue first
    const venue = await Venue.create(venueData);

    let createdCourts = [];

    // If courts are provided, create them
    if (courts && Array.isArray(courts) && courts.length > 0) {
      try {
        // Validate court data
        for (let i = 0; i < courts.length; i++) {
          const court = courts[i];
          if (!court.name || !court.sportType || !court.pricePerHour) {
            throw new Error(`Court ${i + 1}: name, sportType, and pricePerHour are required`);
          }
          if (court.pricePerHour <= 0) {
            throw new Error(`Court ${i + 1}: pricePerHour must be greater than 0`);
          }
          if (court.capacity && court.capacity <= 0) {
            throw new Error(`Court ${i + 1}: capacity must be greater than 0`);
          }
        }

        // Create courts for the venue
        for (const courtData of courts) {
          const court = await Court.create({
            ...courtData,
            venueId: venue.id,
          });
          createdCourts.push(court.toJSON());
        }
      } catch (courtError) {
        // If court creation fails, we could either:
        // 1. Delete the venue and return error (transaction-like behavior)
        // 2. Keep the venue and return partial success
        // For now, we'll keep the venue and log the error
        console.error('Court creation error:', courtError.message);

        res.status(201).json({
          success: true,
          message:
            'Venue created successfully. Awaiting admin approval. Some courts could not be created.',
          data: {
            venue: venue.toJSON(),
            courts: createdCourts,
            courtErrors: courtError.message,
          },
        });
        return;
      }
    }

    res.status(201).json({
      success: true,
      message:
        courts && courts.length > 0
          ? `Venue created successfully with ${createdCourts.length} courts. Awaiting admin approval.`
          : 'Venue created successfully. Awaiting admin approval.',
      data: {
        venue: venue.toJSON(),
        courts: createdCourts,
      },
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create venue',
      error: error.message,
    });
  }
};

// Get a specific venue
export const getVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check ownership
    if (venue.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own venues.',
      });
    }

    // Get courts for this venue
    const courts = await Court.findByVenue(venue.id);

    res.json({
      success: true,
      data: {
        ...venue.toJSON(),
        courts: courts.map((court) => court.toJSON()),
      },
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venue',
      error: error.message,
    });
  }
};

// Update a venue
export const updateVenue = async (req, res) => {
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
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check ownership
    if (venue.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own venues.',
      });
    }

    const updatedVenue = await venue.update(req.body);

    res.json({
      success: true,
      message: 'Venue updated successfully',
      data: updatedVenue.toJSON(),
    });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update venue',
      error: error.message,
    });
  }
};

// Delete a venue
export const deleteVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check ownership
    if (venue.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own venues.',
      });
    }

    await venue.delete();

    res.json({
      success: true,
      message: 'Venue deleted successfully',
    });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete venue',
      error: error.message,
    });
  }
};
