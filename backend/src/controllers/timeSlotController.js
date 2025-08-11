import { validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import TimeSlot from '../models/TimeSlot.js';

// Helper function to verify venue ownership
const verifyVenueOwnership = async (venueId, userId) => {
  const venue = await prisma.venue.findFirst({
    where: { id: parseInt(venueId), ownerId: userId },
  });
  return venue;
};

// Helper function to verify court exists in venue
const verifyCourt = async (venueId, courtId) => {
  const court = await prisma.court.findFirst({
    where: {
      id: parseInt(courtId),
      venueId: parseInt(venueId),
      isActive: true,
    },
  });
  return court;
};

// Get all time slots for a court
export const getTimeSlots = async (req, res) => {
  try {
    const { venueId, courtId } = req.params;
    const { dayOfWeek } = req.query;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Verify court exists
    const court = await verifyCourt(venueId, courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    let timeSlots;
    if (dayOfWeek !== undefined) {
      timeSlots = await TimeSlot.findByCourt(courtId, parseInt(dayOfWeek));
    } else {
      timeSlots = await TimeSlot.findByCourt(courtId);
    }

    res.json({
      success: true,
      data: {
        court: {
          id: court.id,
          name: court.name,
          sportType: court.sportType,
          pricePerHour: court.pricePerHour,
        },
        timeSlots: timeSlots.map((slot) => slot.toJSON()),
      },
    });
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time slots',
      error: error.message,
    });
  }
};

// Create time slots for a court
export const createTimeSlots = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { venueId, courtId } = req.params;
    const { timeSlots } = req.body;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Verify court exists
    const court = await verifyCourt(venueId, courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Time slots array is required and must not be empty',
      });
    }

    // Validate time slots data
    const validatedSlots = [];
    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i];

      if (typeof slot.dayOfWeek !== 'number' || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${i + 1}: dayOfWeek must be 0-6 (Sunday-Saturday)`,
        });
      }

      if (!slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${i + 1}: startTime and endTime are required`,
        });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${i + 1}: startTime and endTime must be in HH:MM format`,
        });
      }

      // Check if end time is after start time
      const start = new Date(`1970-01-01T${slot.startTime}`);
      const end = new Date(`1970-01-01T${slot.endTime}`);
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${i + 1}: endTime must be after startTime`,
        });
      }

      validatedSlots.push({
        venueId: parseInt(venueId),
        courtId: parseInt(courtId),
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable !== false,
      });
    }

    // Check for overlapping time slots
    for (let i = 0; i < validatedSlots.length; i++) {
      for (let j = i + 1; j < validatedSlots.length; j++) {
        const slot1 = validatedSlots[i];
        const slot2 = validatedSlots[j];

        if (slot1.dayOfWeek === slot2.dayOfWeek) {
          const start1 = new Date(`1970-01-01T${slot1.startTime}`);
          const end1 = new Date(`1970-01-01T${slot1.endTime}`);
          const start2 = new Date(`1970-01-01T${slot2.startTime}`);
          const end2 = new Date(`1970-01-01T${slot2.endTime}`);

          if (start1 < end2 && end1 > start2) {
            return res.status(400).json({
              success: false,
              message: `Overlapping time slots detected for ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot1.dayOfWeek]}`,
            });
          }
        }
      }
    }

    // Create time slots
    const result = await TimeSlot.createMultiple(validatedSlots);

    res.status(201).json({
      success: true,
      message: `${result.count} time slots created successfully`,
      data: {
        created: result.count,
        courtId: parseInt(courtId),
        courtName: court.name,
      },
    });
  } catch (error) {
    console.error('Create time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create time slots',
      error: error.message,
    });
  }
};

// Update a specific time slot
export const updateTimeSlot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { venueId, courtId, slotId } = req.params;
    const updateData = req.body;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Find the time slot and verify it belongs to the court
    const timeSlot = await TimeSlot.findById(slotId);
    if (
      !timeSlot ||
      timeSlot.courtId !== parseInt(courtId) ||
      timeSlot.venueId !== parseInt(venueId)
    ) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found',
      });
    }

    // Update the time slot
    const updatedSlot = await timeSlot.update(updateData);

    res.json({
      success: true,
      message: 'Time slot updated successfully',
      data: updatedSlot.toJSON(),
    });
  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update time slot',
      error: error.message,
    });
  }
};

// Delete a specific time slot
export const deleteTimeSlot = async (req, res) => {
  try {
    const { venueId, courtId, slotId } = req.params;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Find the time slot and verify it belongs to the court
    const timeSlot = await TimeSlot.findById(slotId);
    if (
      !timeSlot ||
      timeSlot.courtId !== parseInt(courtId) ||
      timeSlot.venueId !== parseInt(venueId)
    ) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found',
      });
    }

    // Check for future bookings that might conflict
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // Check next 30 days

    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        courtId: parseInt(courtId),
        bookingDate: {
          gte: new Date(),
          lte: futureDate,
        },
        status: { not: 'cancelled' },
      },
    });

    if (conflictingBookings) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete time slot that may conflict with existing bookings',
      });
    }

    await timeSlot.delete();

    res.json({
      success: true,
      message: 'Time slot deleted successfully',
    });
  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete time slot',
      error: error.message,
    });
  }
};

// Get available time slots for a court on a specific date (public endpoint)
export const getAvailableTimeSlots = async (req, res) => {
  console.log('🚨 API CALL: getAvailableTimeSlots');
  try {
    const { courtId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required (YYYY-MM-DD format)',
      });
    }

    console.log(`🔍 Getting available slots for court ${courtId} on ${date}`);

    // Verify court exists and is active
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        isActive: true,
        venue: {
          isApproved: true,
        },
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            isApproved: true,
          },
        },
      },
      orderBy: {
        venueId: 'asc', // Get the court from the venue with lowest ID to be consistent
      },
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or not available',
      });
    }

    console.log(`✅ Found court ${court.id} in venue ${court.venue.id} (${court.venue.name})`);

    const targetDate = new Date(date);
    const availableSlots = await TimeSlot.getAvailableSlots(courtId, date);

    console.log(`📅 Found ${availableSlots.length} available slots for court ${courtId}`);

    res.json({
      success: true,
      data: {
        court: {
          id: court.id,
          name: court.name,
          sportType: court.sportType,
          pricePerHour: court.pricePerHour,
          venue: court.venue,
        },
        date: targetDate.toISOString().split('T')[0],
        dayOfWeek: targetDate.getDay(),
        availableSlots: availableSlots.map((slot) => slot.toJSON()),
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

// Get blocked time slots
export const getBlockedSlots = async (req, res) => {
  try {
    const { venueId, courtId } = req.params;
    const { dayOfWeek } = req.query;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    let whereClause = {
      courtId: parseInt(courtId),
      venueId: parseInt(venueId),
      isAvailable: false,
    };

    if (dayOfWeek !== undefined) {
      whereClause.dayOfWeek = parseInt(dayOfWeek);
    }

    const blockedSlots = await prisma.timeSlot.findMany({
      where: whereClause,
      include: {
        court: {
          select: {
            name: true,
            sportType: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json({
      success: true,
      data: blockedSlots.map((slot) => new TimeSlot(slot).toJSON()),
    });
  } catch (error) {
    console.error('Get blocked slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked slots',
      error: error.message,
    });
  }
};

// Block time slots
export const blockTimeSlots = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { venueId, courtId } = req.params;
    const { slotIds, reason } = req.body;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Verify court exists
    const court = await verifyCourt(venueId, courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    const updatedSlots = await prisma.timeSlot.updateMany({
      where: {
        id: { in: slotIds.map((id) => parseInt(id)) },
        courtId: parseInt(courtId),
        venueId: parseInt(venueId),
      },
      data: {
        isAvailable: false,
      },
    });

    res.json({
      success: true,
      message: `${updatedSlots.count} time slots blocked successfully`,
      data: {
        blocked: updatedSlots.count,
        reason: reason || 'No reason provided',
      },
    });
  } catch (error) {
    console.error('Block time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block time slots',
      error: error.message,
    });
  }
};

// Unblock time slots
export const unblockTimeSlots = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { venueId, courtId } = req.params;
    const { slotIds } = req.body;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Verify court exists
    const court = await verifyCourt(venueId, courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    const updatedSlots = await prisma.timeSlot.updateMany({
      where: {
        id: { in: slotIds.map((id) => parseInt(id)) },
        courtId: parseInt(courtId),
        venueId: parseInt(venueId),
      },
      data: {
        isAvailable: true,
      },
    });

    res.json({
      success: true,
      message: `${updatedSlots.count} time slots unblocked successfully`,
      data: {
        unblocked: updatedSlots.count,
      },
    });
  } catch (error) {
    console.error('Unblock time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock time slots',
      error: error.message,
    });
  }
};

// Generate default time slots for a court
export const generateDefaultTimeSlots = async (req, res) => {
  try {
    const { venueId, courtId } = req.params;
    const {
      operatingHours = { start: '09:00', end: '22:00' },
      slotDuration = 60, // minutes
      daysOfWeek = [1, 2, 3, 4, 5, 6, 0], // Monday to Sunday
    } = req.body;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Verify court exists
    const court = await verifyCourt(venueId, courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    // Delete existing time slots for this court
    await TimeSlot.deleteByCourt(courtId);

    // Generate time slots
    const timeSlots = [];
    const startTime = new Date(`1970-01-01T${operatingHours.start}`);
    const endTime = new Date(`1970-01-01T${operatingHours.end}`);

    for (const dayOfWeek of daysOfWeek) {
      let currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

        if (slotEnd <= endTime) {
          timeSlots.push({
            venueId: parseInt(venueId),
            courtId: parseInt(courtId),
            dayOfWeek,
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: slotEnd.toTimeString().slice(0, 5),
            isAvailable: true,
          });
        }

        currentTime = slotEnd;
      }
    }

    const result = await TimeSlot.createMultiple(timeSlots);

    res.status(201).json({
      success: true,
      message: `${result.count} default time slots generated successfully`,
      data: {
        created: result.count,
        courtId: parseInt(courtId),
        courtName: court.name,
        operatingHours,
        slotDuration,
        daysOfWeek,
      },
    });
  } catch (error) {
    console.error('Generate default time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate default time slots',
      error: error.message,
    });
  }
};
