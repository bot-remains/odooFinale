import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import { validationResult } from 'express-validator';

// Helper function to get venue statistics
const getVenueStats = async (ownerId) => {
  const { query } = await import('../config/database.js');

  const statsQuery = `
    SELECT
      COUNT(DISTINCT v.id) as total_venues,
      COUNT(DISTINCT c.id) as total_courts,
      COUNT(DISTINCT CASE WHEN v.is_approved = true THEN v.id END) as approved_venues,
      COUNT(DISTINCT CASE WHEN v.is_approved = false THEN v.id END) as pending_venues,
      COUNT(DISTINCT CASE WHEN c.is_active = true THEN c.id END) as active_courts,
      COUNT(DISTINCT b.id) as total_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
      COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount END), 0) as total_revenue
    FROM venues v
    LEFT JOIN courts c ON v.id = c.venue_id
    LEFT JOIN bookings b ON c.id = b.court_id
    WHERE v.owner_id = $1
  `;

  const result = await query(statsQuery, [ownerId]);
  return result.rows[0];
};

// Helper function to get recent bookings
const getRecentBookings = async (ownerId, limit = 10) => {
  const { query } = await import('../config/database.js');

  const bookingsQuery = `
    SELECT
      b.*,
      c.name as court_name,
      c.sport_type,
      v.name as venue_name,
      u.name as user_name,
      u.email as user_email
    FROM bookings b
    JOIN courts c ON b.court_id = c.id
    JOIN venues v ON c.venue_id = v.id
    JOIN users u ON b.user_id = u.id
    WHERE v.owner_id = $1
    ORDER BY b.created_at DESC
    LIMIT $2
  `;

  const result = await query(bookingsQuery, [ownerId, limit]);
  return result.rows;
};

// Helper function to get revenue data
const getRevenueData = async (ownerId) => {
  const { query } = await import('../config/database.js');

  const revenueQuery = `
    SELECT
      DATE_TRUNC('day', b.booking_date) as date,
      COUNT(*) as bookings_count,
      SUM(b.total_amount) as daily_revenue
    FROM bookings b
    JOIN courts c ON b.court_id = c.id
    JOIN venues v ON c.venue_id = v.id
    WHERE v.owner_id = $1
      AND b.status = 'confirmed'
      AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', b.booking_date)
    ORDER BY date DESC
  `;

  const result = await query(revenueQuery, [ownerId]);
  return result.rows;
};

// Get dashboard statistics
export const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.userId || req.user.id;

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
    const ownerId = req.user.userId || req.user.id;
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
    console.log('🔍 Create venue request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 User object:', JSON.stringify(req.user, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { courts, ...venueFields } = req.body;

    const venueData = {
      ...venueFields,
      ownerId: req.user.userId || req.user.id,
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
          console.log('🔍 Creating court with data:', JSON.stringify(courtData, null, 2));
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
    console.error('❌ Create venue error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user,
      body: req.body,
    });
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
    if (venue.ownerId !== (req.user.userId || req.user.id)) {
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
    if (venue.ownerId !== (req.user.userId || req.user.id)) {
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
    if (venue.ownerId !== (req.user.userId || req.user.id)) {
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
