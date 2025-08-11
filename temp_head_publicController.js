import prisma from '../config/prisma.js';

<<<<<<< HEAD
// Helper function to get sport description
const getSportDescription = (sportName) => {
  const sport = sportName.toLowerCase();
  switch (sport) {
    case 'badminton': return 'Indoor racquet sport with shuttlecock';
    case 'tennis': return 'Racquet sport on court';
    case 'football': return 'Team sport played with feet';
    case 'cricket': return 'Bat and ball sport with wickets';
    case 'swimming': return 'Aquatic sport and exercise';
    case 'table tennis': return 'Indoor paddle sport';
    case 'basketball': return 'Team sport with hoops';
    case 'volleyball': return 'Team sport with net';
    default: return 'Popular sport activity';
  }
};

// Get all approved venues with search and filters
=======
// Search venues (simplified)
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
export const getAllVenues = async (req, res) => {
  try {
    const {
      search,
      city,
      sport,
      priceMin,
      priceMax,
      rating,
      amenities,
      sortBy,
      limit = 20,
      offset = 0,
    } = req.query;

    let whereClause = {
      isApproved: true,
    };

    // Build search filters
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }

    if (sport) {
      whereClause.courts = {
        some: {
          sportType: sport,
          isActive: true,
        },
      };
    }

    if (priceMin || priceMax) {
      const priceFilter = {};
      if (priceMin) priceFilter.gte = parseFloat(priceMin);
      if (priceMax) priceFilter.lte = parseFloat(priceMax);

      if (whereClause.courts) {
        // If we already have a courts filter, add price to it
        whereClause.courts.some.pricePerHour = priceFilter;
      } else {
        // Create a new courts filter for price
        whereClause.courts = {
          some: {
            pricePerHour: priceFilter,
            isActive: true,
          },
        };
      }
    }

    if (rating) {
      whereClause.rating = { gte: parseFloat(rating) };
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      whereClause.amenities = { hasEvery: amenityList };
    }

    // Build sort order
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price_asc' || sortBy === 'price_desc') {
      // Price sorting not available for venues, fall back to rating
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'name') {
      orderBy = { name: 'asc' };
    }

    const venues = await prisma.venue.findMany({
      where: whereClause,
      include: {
        courts: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sportType: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: orderBy,
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.venue.count({
      where: whereClause,
    });

    res.json({
      success: true,
      data: {
<<<<<<< HEAD
        items: result.rows,
=======
        venues,
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    console.error('Get all venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues',
      error: error.message,
    });
  }
};

// Search venues (simplified) - alias for backwards compatibility
export const searchVenues = getAllVenues;

// Get venue details (simplified)
export const getVenueDetails = async (req, res) => {
  try {
    const { venueId } = req.params;

    const venue = await prisma.venue.findFirst({
      where: {
        id: parseInt(venueId),
        isApproved: true,
      },
      include: {
        courts: {
          where: { isActive: true },
          include: {
            timeSlots: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    res.json({
      success: true,
      data: venue,
    });
  } catch (error) {
    console.error('Get venue details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venue details',
      error: error.message,
    });
  }
};

// Get available time slots (simplified)
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { venueId, courtId, date } = req.query;

    if (!venueId || !courtId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Venue ID, court ID, and date are required',
      });
    }

    // Get existing bookings for the date
    const existingBookings = await prisma.booking.findMany({
      where: {
        venueId: parseInt(venueId),
        courtId: parseInt(courtId),
        bookingDate: new Date(date),
        status: { not: 'cancelled' },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Get court's time slots
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        venueId: parseInt(venueId),
        isActive: true,
      },
      include: {
        timeSlots: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    // Filter out booked time slots
    const availableSlots = court.timeSlots.filter((slot) => {
      return !existingBookings.some(
        (booking) =>
          (slot.startTime >= booking.startTime && slot.startTime < booking.endTime) ||
          (slot.endTime > booking.startTime && slot.endTime <= booking.endTime)
      );
    });

    res.json({
      success: true,
      data: {
        court: {
          id: court.id,
          name: court.name,
          sportType: court.sportType,
        },
        availableSlots,
        date,
      },
    });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available time slots',
      error: error.message,
    });
  }
};

// Get popular venues (simplified)
export const getPopularVenues = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const venues = await prisma.venue.findMany({
      where: {
        isApproved: true,
      },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: 'confirmed',
              },
            },
            reviews: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
      take: parseInt(limit),
    });

    res.json({
      success: true,
      data: venues,
    });
  } catch (error) {
    console.error('Get popular venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular venues',
      error: error.message,
    });
  }
};

// Get available sports (simplified)
export const getAvailableSports = async (req, res) => {
  try {
    const courts = await prisma.court.findMany({
      where: {
        isActive: true,
        venue: {
          isApproved: true,
        },
      },
      select: {
        sportType: true,
      },
      distinct: ['sportType'],
    });

<<<<<<< HEAD
    const sportsQuery = `
      SELECT
        c.sport_type as name,
        c.sport_type as id,
        COUNT(DISTINCT c.id) as courts_count,
        COUNT(DISTINCT v.id) as venues_count,
        AVG(c.price_per_hour) as avg_price,
        MIN(c.price_per_hour) as min_price,
        MAX(c.price_per_hour) as max_price
      FROM courts c
      JOIN venues v ON c.venue_id = v.id
      WHERE c.is_active = true AND v.is_approved = true
      GROUP BY c.sport_type
      ORDER BY courts_count DESC
    `;

    const result = await query(sportsQuery);
=======
    // Extract unique sports
    const uniqueSports = courts.map((court) => court.sportType).sort();
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    // Add descriptions for sports
    const sportsWithDescriptions = result.rows.map(sport => ({
      ...sport,
      description: getSportDescription(sport.name)
    }));

    res.json({
      success: true,
<<<<<<< HEAD
      data: sportsWithDescriptions,
=======
      data: uniqueSports,
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
    });
  } catch (error) {
    console.error('Get available sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available sports',
      error: error.message,
    });
  }
};

<<<<<<< HEAD
// Get sport pricing details by venue and sport
export const getSportPricing = async (req, res) => {
  try {
    const { venueId, sportType } = req.params;

    const { query } = await import('../config/database.js');

    // Get court pricing information for the specific venue and sport
    const pricingQuery = `
      SELECT 
        c.*,
        v.name as venue_name,
        v.operating_hours as venue_operating_hours
      FROM courts c
      JOIN venues v ON c.venue_id = v.id
      WHERE c.venue_id = $1 
        AND LOWER(c.sport_type) = LOWER($2)
        AND c.is_active = true
        AND v.is_approved = true
      ORDER BY c.price_per_hour ASC
      LIMIT 1
    `;

    const result = await query(pricingQuery, [venueId, sportType]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sport not available at this venue',
      });
    }

    const court = result.rows[0];
    const basePrice = parseFloat(court.price_per_hour);

    // Create pricing structure with different time slots
    // This is a simplified version - in real app, you might have a separate pricing table
    const pricingData = {
      name: `${sportType} Premium`,
      sportType: sportType,
      venueId: parseInt(venueId),
      venueName: court.venue_name,
      courtName: court.name,
      weekdays: {
        morning: {
          time: "06:00 AM - 12:00 PM",
          price: Math.round(basePrice * 0.8), // 20% discount for morning
        },
        afternoon: {
          time: "12:00 PM - 05:00 PM", 
          price: basePrice,
        },
        evening: {
          time: "05:00 PM - 10:00 PM",
          price: Math.round(basePrice * 1.2), // 20% premium for evening
        }
      },
      weekend: {
        allDay: {
          time: "06:00 AM - 10:00 PM",
          price: Math.round(basePrice * 1.3), // 30% premium for weekends
        }
      },
      holiday: {
        allDay: {
          time: "06:00 AM - 10:00 PM", 
          price: Math.round(basePrice * 1.4), // 40% premium for holidays
        }
      },
      operatingHours: court.operating_hours || court.venue_operating_hours
=======
// Get venue statistics (simplified)
export const getVenueStatistics = async (req, res) => {
  try {
    const { venueId } = req.params;

    const venue = await prisma.venue.findFirst({
      where: {
        id: parseInt(venueId),
        isApproved: true,
      },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: 'confirmed' },
            },
            reviews: true,
            courts: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    const stats = {
      total_bookings: venue._count.bookings,
      total_reviews: venue._count.reviews,
      total_courts: venue._count.courts,
      average_rating: venue.rating,
      total_revenue: 0, // Calculate if needed
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
    };

    res.json({
      success: true,
<<<<<<< HEAD
      data: pricingData,
    });
  } catch (error) {
    console.error('Get sport pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sport pricing',
=======
      data: stats,
    });
  } catch (error) {
    console.error('Get venue statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venue statistics',
      error: error.message,
    });
  }
};

// Get courts by sport (simplified)
export const getCourtsBySport = async (req, res) => {
  try {
    const { sport } = req.params;
    const { city, limit = 20, offset = 0 } = req.query;

    let whereClause = {
      isActive: true,
      sportType: sport,
      venue: {
        isApproved: true,
      },
    };

    if (city) {
      whereClause.venue.city = { contains: city, mode: 'insensitive' };
    }

    const courts = await prisma.court.findMany({
      where: whereClause,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            rating: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: {
        venue: {
          rating: 'desc',
        },
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.court.count({
      where: whereClause,
    });

    res.json({
      success: true,
      data: {
        courts,
        sport,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    console.error('Get courts by sport error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courts',
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
      error: error.message,
    });
  }
};
