import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import { validationResult } from 'express-validator';

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
export const getAllVenues = async (req, res) => {
  try {
    const {
      search,
      location,
      sportType,
      venueType, // indoor/outdoor
      minRating,
      maxPrice,
      minPrice,
      amenities,
      sortBy = 'rating',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = req.query;

    // Build filters object
    const filters = {};

    if (search) filters.search = search;
    if (location) filters.location = location;
    if (sportType) filters.sportType = sportType;
    if (venueType) filters.venueType = venueType; // indoor/outdoor
    if (minRating) filters.minRating = parseFloat(minRating);
    if (amenities) {
      filters.amenities = Array.isArray(amenities) ? amenities : [amenities];
    }

    // Get venues with courts and availability
    const { query } = await import('../config/database.js');

    let whereClause = 'WHERE v.is_approved = true';
    const params = [];
    let paramCount = 1;

    // Apply search filter
    if (search) {
      whereClause += ` AND (v.name ILIKE $${paramCount} OR v.description ILIKE $${paramCount} OR v.location ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Apply location filter
    if (location) {
      whereClause += ` AND v.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    // Apply rating filter
    if (minRating) {
      whereClause += ` AND v.rating >= $${paramCount}`;
      params.push(minRating);
      paramCount++;
    }

    // Apply sport type filter (through courts)
    if (sportType) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM courts c
        WHERE c.venue_id = v.id
        AND c.sport_type = $${paramCount}
        AND c.is_active = true
      )`;
      params.push(sportType);
      paramCount++;
    }

    // Apply price filters (through courts)
    if (minPrice || maxPrice) {
      let priceCondition = '';
      if (minPrice && maxPrice) {
        priceCondition = `AND c.price_per_hour BETWEEN $${paramCount} AND $${paramCount + 1}`;
        params.push(minPrice, maxPrice);
        paramCount += 2;
      } else if (minPrice) {
        priceCondition = `AND c.price_per_hour >= $${paramCount}`;
        params.push(minPrice);
        paramCount++;
      } else if (maxPrice) {
        priceCondition = `AND c.price_per_hour <= $${paramCount}`;
        params.push(maxPrice);
        paramCount++;
      }

      if (priceCondition) {
        whereClause += ` AND EXISTS (
          SELECT 1 FROM courts c
          WHERE c.venue_id = v.id
          AND c.is_active = true
          ${priceCondition}
        )`;
      }
    }

    // Apply amenities filter
    if (amenities && filters.amenities.length > 0) {
      whereClause += ` AND v.amenities && $${paramCount}`;
      params.push(filters.amenities);
      paramCount++;
    }

    // Apply venue type filter (indoor/outdoor)
    if (venueType && venueType !== 'all') {
      if (venueType === 'indoor') {
        whereClause += ` AND (v.amenities @> '["Indoor", "AC", "Air Conditioning"]'::jsonb OR 
                              v.name ILIKE '%indoor%' OR 
                              v.description ILIKE '%indoor%')`;
      } else if (venueType === 'outdoor') {
        whereClause += ` AND NOT (v.amenities @> '["Indoor", "AC", "Air Conditioning"]'::jsonb OR 
                                  v.name ILIKE '%indoor%' OR 
                                  v.description ILIKE '%indoor%')`;
      }
    }

    // Determine sort order
    let orderClause = 'ORDER BY v.rating DESC, v.created_at DESC';
    if (sortBy === 'price') {
      orderClause = `ORDER BY min_price ${sortOrder.toUpperCase()}, v.rating DESC`;
    } else if (sortBy === 'name') {
      orderClause = `ORDER BY v.name ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'location') {
      orderClause = `ORDER BY v.location ${sortOrder.toUpperCase()}, v.rating DESC`;
    }

    params.push(limit, offset);

    const venuesQuery = `
      SELECT
        v.*,
        COUNT(DISTINCT c.id) as courts_count,
        MIN(c.price_per_hour) as min_price,
        MAX(c.price_per_hour) as max_price,
        ARRAY_AGG(DISTINCT c.sport_type) FILTER (WHERE c.sport_type IS NOT NULL) as available_sports,
        u.name as owner_name
      FROM venues v
      LEFT JOIN courts c ON v.id = c.venue_id AND c.is_active = true
      LEFT JOIN users u ON v.owner_id = u.id
      ${whereClause}
      GROUP BY v.id, u.name
      ${orderClause}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(venuesQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM venues v
      LEFT JOIN courts c ON v.id = c.venue_id AND c.is_active = true
      ${whereClause.replace(/GROUP BY.*|ORDER BY.*|LIMIT.*|OFFSET.*/g, '')}
    `;
    const countResult = await query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        items: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total),
        },
      },
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

// Get venue details by ID with courts and availability
export const getVenueDetails = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { date } = req.query;

    const venue = await Venue.findById(venueId);
    if (!venue || !venue.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found or not available',
      });
    }

    // Get courts with availability for the specified date
    const courts = await Court.findByVenue(venueId);

    // Get availability for each court if date is provided
    const courtsWithAvailability = await Promise.all(
      courts.map(async (court) => {
        const courtData = court.toJSON();

        if (date) {
          try {
            const availableSlots = await court.getAvailableSlots(date);
            courtData.availableSlots = availableSlots;
          } catch (error) {
            console.warn(`Failed to get availability for court ${court.id}:`, error.message);
            courtData.availableSlots = [];
          }
        }

        return courtData;
      })
    );

    // Get venue reviews
    const { query } = await import('../config/database.js');
    const reviewsQuery = `
      SELECT
        r.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.venue_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const reviewsResult = await query(reviewsQuery, [venueId]);

    res.json({
      success: true,
      data: {
        venue: venue.toJSON(),
        courts: courtsWithAvailability,
        reviews: reviewsResult.rows,
        requestedDate: date,
      },
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

// Get courts by sport type with availability
export const getCourtsBySport = async (req, res) => {
  try {
    const { sportType } = req.params;
    const { location, date, startTime, endTime, maxPrice, limit = 20, offset = 0 } = req.query;

    const courts = await Court.findBySportType(sportType, limit, offset);

    // Filter and enhance with availability data
    const courtsWithDetails = await Promise.all(
      courts.map(async (court) => {
        const courtData = {
          ...court.toJSON(),
          venue_name: court.venue_name,
          venue_location: court.venue_location,
          venue_rating: court.venue_rating,
        };

        // Apply location filter
        if (location && !court.venue_location.toLowerCase().includes(location.toLowerCase())) {
          return null;
        }

        // Apply price filter
        if (maxPrice && court.pricePerHour > maxPrice) {
          return null;
        }

        // Check availability if date and time are provided
        if (date && startTime && endTime) {
          try {
            const isAvailable = await court.checkAvailability(date, startTime, endTime);
            courtData.isAvailable = isAvailable;

            if (!isAvailable) {
              courtData.nextAvailableSlot = await findNextAvailableSlot(
                court,
                date,
                startTime,
                endTime
              );
            }
          } catch (error) {
            console.warn(`Failed to check availability for court ${court.id}:`, error.message);
            courtData.isAvailable = null;
          }
        }

        return courtData;
      })
    );

    // Filter out null results and unavailable courts if checking availability
    const filteredCourts = courtsWithDetails.filter((court) => {
      if (!court) return false;
      if (date && startTime && endTime && court.isAvailable === false) {
        return false; // Only show available courts when checking specific time
      }
      return true;
    });

    res.json({
      success: true,
      data: {
        sportType,
        courts: filteredCourts,
        filters: { location, date, startTime, endTime, maxPrice },
        pagination: { limit: parseInt(limit), offset: parseInt(offset) },
      },
    });
  } catch (error) {
    console.error('Get courts by sport error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courts',
      error: error.message,
    });
  }
};

// Helper function to find next available slot
const findNextAvailableSlot = async (
  court,
  requestedDate,
  requestedStartTime,
  requestedEndTime
) => {
  try {
    const startDate = new Date(requestedDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // Check next 7 days

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const availableSlots = await court.getAvailableSlots(dateStr);

      // Find a slot that matches the requested duration
      const requestedDuration = calculateDuration(requestedStartTime, requestedEndTime);
      const matchingSlot = availableSlots.find((slot) => {
        const slotDuration = calculateDuration(slot.startTime, slot.endTime);
        return slotDuration >= requestedDuration;
      });

      if (matchingSlot) {
        return {
          date: dateStr,
          startTime: matchingSlot.startTime,
          endTime: matchingSlot.endTime,
          price: matchingSlot.price,
        };
      }
    }

    return null; // No available slot found in next 7 days
  } catch (error) {
    console.warn('Failed to find next available slot:', error.message);
    return null;
  }
};

// Helper function to calculate duration in hours
const calculateDuration = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return (end - start) / (1000 * 60 * 60);
};

// Get popular venues (trending, most booked, highest rated)
export const getPopularVenues = async (req, res) => {
  try {
    const { type = 'rating', limit = 10 } = req.query;

    const { query } = await import('../config/database.js');

    let orderClause;
    let selectClause = `
      SELECT
        v.*,
        COUNT(DISTINCT c.id) as courts_count,
        MIN(c.price_per_hour) as min_price,
        ARRAY_AGG(DISTINCT c.sport_type) FILTER (WHERE c.sport_type IS NOT NULL) as available_sports
    `;

    switch (type) {
      case 'bookings':
        selectClause += `, COUNT(DISTINCT b.id) as total_bookings`;
        orderClause = 'ORDER BY total_bookings DESC, v.rating DESC';
        break;
      case 'recent':
        orderClause = 'ORDER BY v.created_at DESC, v.rating DESC';
        break;
      case 'rating':
      default:
        orderClause = 'ORDER BY v.rating DESC, v.total_reviews DESC';
        break;
    }

    const popularQuery = `
      ${selectClause}
      FROM venues v
      LEFT JOIN courts c ON v.id = c.venue_id AND c.is_active = true
      LEFT JOIN bookings b ON c.id = b.court_id AND b.status = 'confirmed'
      WHERE v.is_approved = true
      GROUP BY v.id
      ${orderClause}
      LIMIT $1
    `;

    const result = await query(popularQuery, [limit]);

    res.json({
      success: true,
      data: {
        type,
        venues: result.rows,
      },
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

// Get available sports types
export const getAvailableSports = async (req, res) => {
  try {
    const { query } = await import('../config/database.js');

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

    // Add descriptions for sports
    const sportsWithDescriptions = result.rows.map(sport => ({
      ...sport,
      description: getSportDescription(sport.name)
    }));

    res.json({
      success: true,
      data: sportsWithDescriptions,
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
    };

    res.json({
      success: true,
      data: pricingData,
    });
  } catch (error) {
    console.error('Get sport pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sport pricing',
      error: error.message,
    });
  }
};
