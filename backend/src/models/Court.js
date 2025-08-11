import prisma from '../config/prisma.js';

class Court {
  constructor(courtData) {
    this.id = courtData.id;
    this.venueId = courtData.venueId;
    this.name = courtData.name;
    this.sportType = courtData.sportType;
    this.pricePerHour = courtData.pricePerHour;
    this.photos = courtData.photos;
    this.amenities = courtData.amenities;
    this.isActive = courtData.isActive;
    this.createdAt = courtData.createdAt;
    this.updatedAt = courtData.updatedAt;

    // Related data
    this.venueName = courtData.venue?.name;
    this.venueLocation = courtData.venue?.location;
  }

  // Create a new court
  static async create(courtData) {
<<<<<<< HEAD
    const { 
      venueId, 
      name, 
      sportType, 
      pricePerHour, 
      operatingHours,
      maxPlayers,
      description 
    } = courtData;
=======
    const { venueId, name, sportType, pricePerHour, photos = [], amenities = [] } = courtData;
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4

    const court = await prisma.court.create({
      data: {
        venueId,
        name,
        sportType,
        pricePerHour,
        photos,
        amenities,
      },
      select: {
        id: true,
        venueId: true,
        name: true,
        sportType: true,
        pricePerHour: true,
        photos: true,
        amenities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });

<<<<<<< HEAD
    // Format operating hours for database
    const formattedOperatingHours = typeof operatingHours === 'object' 
      ? JSON.stringify(operatingHours)
      : operatingHours;

    const result = await query(insertQuery, [
      venueId,
      name,
      sportType,
      pricePerHour,
      formattedOperatingHours,
    ]);
    return new Court(result.rows[0]);
=======
    return new Court(court);
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
  }

  // Find court by ID
  static async findById(id) {
    const court = await prisma.court.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        venueId: true,
        name: true,
        sportType: true,
        pricePerHour: true,
        photos: true,
        amenities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            name: true,
            location: true,
            ownerId: true,
          },
        },
        timeSlots: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    return court ? new Court(court) : null;
  }

  // Get courts by venue
  static async findByVenue(venueId, includeInactive = false) {
    const where = {
      venueId: parseInt(venueId),
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const courts = await prisma.court.findMany({
      where,
      select: {
        id: true,
        venueId: true,
        name: true,
        sportType: true,
        pricePerHour: true,
        photos: true,
        amenities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return courts.map((court) => new Court(court));
  }

  // Get courts by sport type
  static async findBySportType(sportType, venueId = null) {
    const where = {
      sportType,
      isActive: true,
    };

    if (venueId) {
      where.venueId = parseInt(venueId);
    }

    const courts = await prisma.court.findMany({
      where,
      select: {
        id: true,
        venueId: true,
        name: true,
        sportType: true,
        pricePerHour: true,
        photos: true,
        amenities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            name: true,
            location: true,
            isApproved: true,
          },
        },
      },
      orderBy: {
        pricePerHour: 'asc',
      },
    });

    // Filter only approved venues if no specific venue ID
    if (!venueId) {
      return courts.filter((court) => court.venue.isApproved).map((court) => new Court(court));
    }

    return courts.map((court) => new Court(court));
  }

  // Search courts with filters
  static async search(filters = {}, limit = 20, offset = 0) {
    const where = {
      isActive: true,
      venue: {
        isApproved: true,
      },
    };

    if (filters.sportType) {
      where.sportType = filters.sportType;
    }

    if (filters.location) {
      where.venue.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters.maxPrice) {
      where.pricePerHour = {
        lte: parseFloat(filters.maxPrice),
      };
    }

    if (filters.minPrice) {
      where.pricePerHour = {
        gte: parseFloat(filters.minPrice),
      };
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          venue: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const courts = await prisma.court.findMany({
      where,
      select: {
        id: true,
        venueId: true,
        name: true,
        sportType: true,
        pricePerHour: true,
        photos: true,
        amenities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            name: true,
            location: true,
            rating: true,
          },
        },
      },
      orderBy: [{ venue: { rating: 'desc' } }, { pricePerHour: 'asc' }],
      take: limit,
      skip: offset,
    });

    return courts.map((court) => new Court(court));
  }

  // Update court
  async update(updateData) {
    const allowedFields = ['name', 'sportType', 'pricePerHour', 'photos', 'amenities', 'isActive'];

    const prismaUpdateData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        prismaUpdateData[key] = updateData[key];
      }
    });

    if (Object.keys(prismaUpdateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const updatedCourt = await prisma.court.update({
      where: { id: this.id },
      data: prismaUpdateData,
      select: {
        id: true,
        venueId: true,
        name: true,
        sportType: true,
        pricePerHour: true,
        photos: true,
        amenities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });

    return new Court(updatedCourt);
  }

  // Delete court
  async delete() {
    await prisma.court.delete({
      where: { id: this.id },
    });

    return true;
  }

  // Deactivate court (soft delete)
  async deactivate() {
    const updatedCourt = await prisma.court.update({
      where: { id: this.id },
      data: { isActive: false },
    });

    return new Court(updatedCourt);
  }

  // Activate court
  async activate() {
    const updatedCourt = await prisma.court.update({
      where: { id: this.id },
      data: { isActive: true },
    });

    return new Court(updatedCourt);
  }

  // Check court availability for a specific date and time
  async checkAvailability(date, startTime, endTime) {
    const bookingDate = new Date(date);
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        courtId: this.id,
        bookingDate,
        status: {
          not: 'cancelled',
        },
        OR: [
          {
            AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
          },
          {
            AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
          },
          {
            AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
          },
        ],
      },
    });

    return conflictingBookings.length === 0;
  }

  // Get court bookings for a specific date
  async getBookings(date) {
    const bookingDate = new Date(date);

    const bookings = await prisma.booking.findMany({
      where: {
        courtId: this.id,
        bookingDate,
        status: {
          not: 'cancelled',
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return bookings;
  }

  // Get court statistics
  async getStats(startDate = null, endDate = null) {
    const where = {
      courtId: this.id,
    };

    if (startDate && endDate) {
      where.bookingDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [bookingStats, revenue] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
      }),
      prisma.booking.aggregate({
        where: {
          ...where,
          status: {
            in: ['confirmed', 'completed'],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const stats = {
      totalBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: parseFloat(revenue._sum.totalAmount) || 0,
    };

    bookingStats.forEach((stat) => {
      stats.totalBookings += stat._count.id;
      switch (stat.status) {
        case 'confirmed':
          stats.confirmedBookings = stat._count.id;
          break;
        case 'completed':
          stats.completedBookings = stat._count.id;
          break;
        case 'cancelled':
          stats.cancelledBookings = stat._count.id;
          break;
      }
    });

    return stats;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      venueId: this.venueId,
      name: this.name,
      sportType: this.sportType,
      pricePerHour: parseFloat(this.pricePerHour),
      photos: this.photos,
      amenities: this.amenities,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      venueName: this.venueName,
      venueLocation: this.venueLocation,
    };
  }
}

export default Court;
