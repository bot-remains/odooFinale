import { validationResult } from 'express-validator';
import prisma from '../config/prisma.js';

// Get available time slots for a court (simplified)
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { dayOfWeek } = req.query;

    if (!courtId) {
      return res.status(400).json({
        success: false,
        message: 'Court ID is required',
      });
    }

    // Verify court exists
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        isActive: true,
      },
      include: {
        venue: {
          select: {
            name: true,
            isApproved: true,
          },
        },
      },
    });

    if (!court || !court.venue.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or not available',
      });
    }

    let whereClause = {
      courtId: parseInt(courtId),
    };

    // If specific day of week provided
    if (dayOfWeek !== undefined) {
      whereClause.dayOfWeek = parseInt(dayOfWeek);
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: whereClause,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json({
      success: true,
      data: {
        court,
        timeSlots,
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

// Create time slots for a court (simplified)
export const createTimeSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: 'Slots array is required',
      });
    }

    // Verify court exists and user owns it
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        venue: {
          ownerId: req.user.id,
        },
      },
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or access denied',
      });
    }

    // Create time slots
    const createdSlots = await prisma.timeSlot.createMany({
      data: slots.map((slot) => ({
        venueId: court.venueId,
        courtId: parseInt(courtId),
        dayOfWeek: parseInt(slot.dayOfWeek),
        startTime: new Date(`1970-01-01T${slot.startTime}`),
        endTime: new Date(`1970-01-01T${slot.endTime}`),
        isAvailable: slot.isAvailable !== false,
      })),
    });

    res.status(201).json({
      success: true,
      message: 'Time slots created successfully',
      data: {
        created: createdSlots.count,
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

// Update time slot (simplified)
export const updateTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;

    // Verify time slot exists and user owns it
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: parseInt(slotId),
        court: {
          venue: {
            ownerId: req.user.id,
          },
        },
      },
    });

    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found or access denied',
      });
    }

    const updateData = {};
    if (dayOfWeek !== undefined) updateData.dayOfWeek = parseInt(dayOfWeek);
    if (startTime) updateData.startTime = new Date(`1970-01-01T${startTime}`);
    if (endTime) updateData.endTime = new Date(`1970-01-01T${endTime}`);
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const updatedSlot = await prisma.timeSlot.update({
      where: { id: parseInt(slotId) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Time slot updated successfully',
      data: updatedSlot,
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

// Delete time slot (simplified)
export const deleteTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    // Verify time slot exists and user owns it
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: parseInt(slotId),
        court: {
          venue: {
            ownerId: req.user.id,
          },
        },
      },
    });

    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found or access denied',
      });
    }

    // Check if slot is currently being used
    // For time slots (recurring), we check if the slot pattern matches any upcoming bookings
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Check for bookings that might conflict with this time slot pattern
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        courtId: timeSlot.courtId,
        bookingDate: {
          gte: today,
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

    await prisma.timeSlot.delete({
      where: { id: parseInt(slotId) },
    });

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

// Get blocked time slots (simplified) - updated to use dayOfWeek
export const getBlockedSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { dayOfWeek } = req.query;

    let whereClause = {
      courtId: parseInt(courtId),
      isAvailable: false,
    };

    if (dayOfWeek !== undefined) {
      whereClause.dayOfWeek = parseInt(dayOfWeek);
    }

    const blockedSlots = await prisma.timeSlot.findMany({
      where: whereClause,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json({
      success: true,
      data: blockedSlots,
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

// Block time slots (simplified)
export const blockTimeSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { slotIds, reason } = req.body;

    if (!slotIds || !Array.isArray(slotIds)) {
      return res.status(400).json({
        success: false,
        message: 'Slot IDs array is required',
      });
    }

    // Verify court exists and user owns it
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        venue: {
          ownerId: req.user.id,
        },
      },
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or access denied',
      });
    }

    const updatedSlots = await prisma.timeSlot.updateMany({
      where: {
        id: { in: slotIds.map((id) => parseInt(id)) },
        courtId: parseInt(courtId),
      },
      data: {
        isAvailable: false,
      },
    });

    res.json({
      success: true,
      message: 'Time slots blocked successfully',
      data: {
        blocked: updatedSlots.count,
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

// Unblock time slots (simplified)
export const unblockTimeSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { slotIds } = req.body;

    if (!slotIds || !Array.isArray(slotIds)) {
      return res.status(400).json({
        success: false,
        message: 'Slot IDs array is required',
      });
    }

    // Verify court exists and user owns it
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        venue: {
          ownerId: req.user.id,
        },
      },
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or access denied',
      });
    }

    const updatedSlots = await prisma.timeSlot.updateMany({
      where: {
        id: { in: slotIds.map((id) => parseInt(id)) },
        courtId: parseInt(courtId),
      },
      data: {
        isAvailable: true,
      },
    });

    res.json({
      success: true,
      message: 'Time slots unblocked successfully',
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
