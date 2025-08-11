import prisma from '../config/prisma.js';

class Venue {
  constructor(venueData) {
    this.id = venueData.id;
    this.name = venueData.name;
    this.description = venueData.description;
    this.address = venueData.address;
    this.location = venueData.location;
    this.amenities = Array.isArray(venueData.amenities) ? venueData.amenities : (venueData.amenities ? JSON.parse(venueData.amenities) : []);
    this.photos = Array.isArray(venueData.photos) ? venueData.photos : (venueData.photos ? JSON.parse(venueData.photos) : []);
    this.rating = venueData.rating;
    this.totalReviews = venueData.totalReviews;
    this.ownerId = venueData.ownerId;
    this.isApproved = venueData.isApproved;
    this.contactEmail = venueData.contactEmail;
    this.contactPhone = venueData.contactPhone;
    this.rejectionReason = venueData.rejectionReason;
    this.rejectedAt = venueData.rejectedAt;
    this.rejectedBy = venueData.rejectedBy;
    this.approvedAt = venueData.approvedAt;
    this.approvedBy = venueData.approvedBy;
    this.createdAt = venueData.createdAt;
    this.updatedAt = venueData.updatedAt;

<<<<<<< HEAD
  // Create venues table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        amenities JSONB DEFAULT '[]', -- JSONB array of amenities
        photos JSONB DEFAULT '[]', -- JSONB array of photo URLs
        contact_phone VARCHAR(20),
        contact_email VARCHAR(255),
        rating DECIMAL(2,1) DEFAULT 0.0,
        total_reviews INTEGER DEFAULT 0,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_approved BOOLEAN DEFAULT false,
        rejection_reason TEXT,
        rejected_at TIMESTAMP,
        rejected_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        approved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add contact columns if they don't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='contact_phone') THEN
          ALTER TABLE venues ADD COLUMN contact_phone VARCHAR(20);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='contact_email') THEN
          ALTER TABLE venues ADD COLUMN contact_email VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='rejection_reason') THEN
          ALTER TABLE venues ADD COLUMN rejection_reason TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='rejected_at') THEN
          ALTER TABLE venues ADD COLUMN rejected_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='rejected_by') THEN
          ALTER TABLE venues ADD COLUMN rejected_by INTEGER REFERENCES users(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='approved_at') THEN
          ALTER TABLE venues ADD COLUMN approved_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='approved_by') THEN
          ALTER TABLE venues ADD COLUMN approved_by INTEGER REFERENCES users(id);
        END IF;
      END $$;

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id);
      CREATE INDEX IF NOT EXISTS idx_venues_approved ON venues(is_approved);
      CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(location);
      CREATE INDEX IF NOT EXISTS idx_venues_rating ON venues(rating);

      -- Create trigger to update updated_at
      CREATE OR REPLACE FUNCTION update_venues_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
      CREATE TRIGGER update_venues_updated_at
          BEFORE UPDATE ON venues
          FOR EACH ROW
          EXECUTE FUNCTION update_venues_updated_at();

      -- Migrate existing TEXT[] columns to JSONB
      DO $$ 
      BEGIN
        -- Check if amenities is TEXT[] and convert to JSONB
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='venues' AND column_name='amenities' AND data_type='ARRAY'
        ) THEN
          ALTER TABLE venues ALTER COLUMN amenities TYPE JSONB USING 
            CASE 
              WHEN amenities IS NULL THEN '[]'::jsonb
              ELSE array_to_json(amenities)::jsonb
            END;
        END IF;

        -- Check if photos is TEXT[] and convert to JSONB
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='venues' AND column_name='photos' AND data_type='ARRAY'
        ) THEN
          ALTER TABLE venues ALTER COLUMN photos TYPE JSONB USING 
            CASE 
              WHEN photos IS NULL THEN '[]'::jsonb
              ELSE array_to_json(photos)::jsonb
            END;
        END IF;

        -- Ensure updated_at has a default value
        ALTER TABLE venues ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE venues ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
      END $$;
    `;

    try {
      await query(createTableQuery);
      console.log('✅ Venues table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating venues table:', error.message);
      throw error;
    }
=======
    // Additional computed fields
    this.ownerName = venueData.owner?.name;
    this.ownerEmail = venueData.owner?.email;
    this.startingPrice = venueData.startingPrice;
    this.availableSports = venueData.availableSports;
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
  }

  // Create a new venue
  static async create(venueData) {
    const {
      name,
      description,
      address,
      location,
      amenities = [],
      photos = [],
      contactPhone,
      contactEmail,
      ownerId,
      contactEmail,
      contactPhone,
    } = venueData;

<<<<<<< HEAD
    const insertQuery = `
      INSERT INTO venues (name, description, address, location, amenities, photos, contact_phone, contact_email, owner_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      name,
      description,
      address,
      location,
      JSON.stringify(amenities || []),  // Convert to JSON string for JSONB column
      JSON.stringify(photos || []),     // Convert to JSON string for JSONB column
      contactPhone,
      contactEmail,
      ownerId,
    ]);
    return new Venue(result.rows[0]);
=======
    const venue = await prisma.venue.create({
      data: {
        name,
        description,
        address,
        location,
        amenities,
        photos,
        ownerId,
        contactEmail,
        contactPhone,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return new Venue(venue);
>>>>>>> 1bb060449e74938b0bb2c1e3a2ca98430d3c38c4
  }

  // Find venue by ID
  static async findById(id) {
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(id) },
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
            name: true,
            sportType: true,
            pricePerHour: true,
            isActive: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    return venue ? new Venue(venue) : null;
  }

  // Get all approved venues with filters
  static async findAll(filters = {}, limit = 20, offset = 0) {
    const where = {
      isApproved: true,
      ...filters,
    };

    // Handle sport type filter
    if (filters.sportType) {
      where.courts = {
        some: {
          sportType: filters.sportType,
          isActive: true,
        },
      };
      delete where.sportType;
    }

    // Handle location filter
    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    // Handle minimum rating filter
    if (filters.minRating) {
      where.rating = {
        gte: parseFloat(filters.minRating),
      };
    }

    // Handle search filter
    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
      delete where.search;
    }

    const venues = await prisma.venue.findMany({
      where,
      include: {
        courts: {
          where: { isActive: true },
          select: {
            sportType: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    });

    return venues.map((venue) => {
      // Calculate starting price and available sports
      const startingPrice =
        venue.courts.length > 0
          ? Math.min(...venue.courts.map((c) => parseFloat(c.pricePerHour)))
          : null;

      const availableSports = [...new Set(venue.courts.map((c) => c.sportType))];

      return new Venue({
        ...venue,
        startingPrice,
        availableSports,
      });
    });
  }

  // Get venues by owner
  static async findByOwner(ownerId, includeDetails = false) {
    const include = includeDetails
      ? {
          courts: {
            select: {
              id: true,
              name: true,
              sportType: true,
              pricePerHour: true,
              isActive: true,
            },
          },
          bookings: {
            where: {
              status: 'confirmed',
            },
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        }
      : undefined;

    const venues = await prisma.venue.findMany({
      where: { ownerId: parseInt(ownerId) },
      include,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return venues.map((venue) => new Venue(venue));
  }

  // Get venues for admin review (pending approval)
  static async findPendingApproval(limit = 20, offset = 0) {
    const venues = await prisma.venue.findMany({
      where: {
        isApproved: false,
        rejectedAt: null,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        courts: {
          select: {
            name: true,
            sportType: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    });

    return venues.map((venue) => new Venue(venue));
  }

  // Get all venues for admin
  static async findAllForAdmin(filters = {}, limit = 20, offset = 0) {
    const where = { ...filters };

    const venues = await prisma.venue.findMany({
      where,
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
            name: true,
            sportType: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return venues.map((venue) => new Venue(venue));
  }

  // Update venue
  async update(updateData) {
    const prismaUpdateData = {};

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        prismaUpdateData[key] = updateData[key];
      }
    });

    if (Object.keys(prismaUpdateData).length === 0) {
      throw new Error('No fields to update');
    }

    const updatedVenue = await prisma.venue.update({
      where: { id: this.id },
      data: prismaUpdateData,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return new Venue(updatedVenue);
  }

  // Approve venue
  async approve(adminId) {
    const updatedVenue = await prisma.venue.update({
      where: { id: this.id },
      data: {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return new Venue(updatedVenue);
  }

  // Reject venue
  async reject(adminId, rejectionReason) {
    const updatedVenue = await prisma.venue.update({
      where: { id: this.id },
      data: {
        isApproved: false,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason,
        approvedBy: null,
        approvedAt: null,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return new Venue(updatedVenue);
  }

  // Update rating (called when reviews change)
  async updateRating() {
    const stats = await prisma.review.aggregate({
      where: { venueId: this.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    const updatedVenue = await prisma.venue.update({
      where: { id: this.id },
      data: {
        rating: stats._avg.rating || 0,
        totalReviews: stats._count.id || 0,
      },
    });

    return new Venue(updatedVenue);
  }

  // Delete venue
  async delete() {
    const result = await prisma.venue.delete({
      where: { id: this.id },
      select: { id: true },
    });

    return !!result;
  }

  // Get venue statistics
  static async getStatistics(filters = {}) {
    const where = { ...filters };

    const [total, approved, pending, rejected] = await Promise.all([
      prisma.venue.count({ where }),
      prisma.venue.count({ where: { ...where, isApproved: true } }),
      prisma.venue.count({ where: { ...where, isApproved: false, rejectedAt: null } }),
      prisma.venue.count({ where: { ...where, rejectedAt: { not: null } } }),
    ]);

    return {
      total,
      approved,
      pending,
      rejected,
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      address: this.address,
      location: this.location,
      amenities: this.amenities,
      photos: this.photos,
      rating: parseFloat(this.rating) || 0,
      totalReviews: this.totalReviews || 0,
      ownerId: this.ownerId,
      isApproved: this.isApproved,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      rejectionReason: this.rejectionReason,
      rejectedAt: this.rejectedAt,
      rejectedBy: this.rejectedBy,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ownerName: this.ownerName,
      ownerEmail: this.ownerEmail,
      startingPrice: this.startingPrice,
      availableSports: this.availableSports,
    };
  }
}

export default Venue;
