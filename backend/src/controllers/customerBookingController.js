import { validationResult } from 'express-validator';
import prisma from '../config/prisma.js';

// Get user's bookings (simplified)
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const whereClause = { userId: userId };
    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        venue: {
          select: {
            name: true,
            address: true,
          },
        },
        court: {
          select: {
            name: true,
            sportType: true,
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const totalCount = await prisma.booking.count({
      where: whereClause,
    });

    res.json({
      success: true,
      data: {
        items: bookings, // Changed from 'bookings' to 'items' to match frontend interface
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasNext: parseInt(offset) + parseInt(limit) < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

// Get booking details (simplified)
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        userId: userId,
      },
      include: {
        venue: {
          select: {
            name: true,
            address: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
        court: {
          select: {
            name: true,
            sportType: true,
            description: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message,
    });
  }
};

// Create a new booking (simplified)
export const createBooking = async (req, res) => {
  try {
    const { courtId, bookingDate, startTime, endTime, totalAmount, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!courtId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'courtId, bookingDate, startTime, and endTime are required',
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'startTime and endTime must be in HH:mm format',
      });
    }

    // Validate that end time is after start time
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Validate booking date is not in the past
    const bookingDateObj = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDateObj < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates',
      });
    }

    // Check if court exists and is available
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        isActive: true,
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
    });

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or unavailable',
      });
    }

    if (!court.venue.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Venue is not approved for bookings',
      });
    }

    // Check if the time slot exists and is available in the database
    const dayOfWeek = bookingDateObj.getDay();
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        courtId: parseInt(courtId),
        dayOfWeek: dayOfWeek,
        startTime: {
          gte: new Date(`1970-01-01T${startTime}:00.000Z`),
          lt: new Date(`1970-01-01T${startTime}:01.000Z`), // Allow 1 minute tolerance
        },
        endTime: {
          gte: new Date(`1970-01-01T${endTime}:00.000Z`),
          lt: new Date(`1970-01-01T${endTime}:01.000Z`), // Allow 1 minute tolerance
        },
        isAvailable: true,
      },
    });

    if (!timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available for this court',
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        courtId: parseInt(courtId),
        bookingDate: bookingDateObj,
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(`1970-01-01T${startTime}:00.000Z`) } },
              { endTime: { gt: new Date(`1970-01-01T${startTime}:00.000Z`) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(`1970-01-01T${endTime}:00.000Z`) } },
              { endTime: { gte: new Date(`1970-01-01T${endTime}:00.000Z`) } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is already booked',
      });
    }

    // Calculate duration in minutes
    const durationInMinutes = (end - start) / (1000 * 60);

    // Use provided total amount or calculate from court price
    const finalAmount = totalAmount || court.pricePerHour * (durationInMinutes / 60);

    // Create booking with transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: userId,
          venueId: court.venue.id,
          courtId: parseInt(courtId),
          bookingDate: bookingDateObj,
          startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
          endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
          totalAmount: finalAmount,
          status: 'confirmed', // Auto-confirm for now
          paymentStatus: 'pending',
          notes: notes || '',
          confirmedAt: new Date(),
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
              contactPhone: true,
              contactEmail: true,
            },
          },
          court: {
            select: {
              id: true,
              name: true,
              sportType: true,
              pricePerHour: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return newBooking;
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A booking already exists for this time slot',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

// Cancel booking (simplified)
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        userId: userId,
        status: { not: 'cancelled' },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already cancelled',
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by customer',
      },
      include: {
        venue: { select: { name: true } },
        court: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
};

// Reschedule booking (simplified)
export const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newDate, newStartTime, newEndTime } = req.body;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        userId: userId,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or cannot be rescheduled',
      });
    }

    // Check new time slot availability
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        courtId: booking.courtId,
        bookingDate: new Date(newDate),
        status: { not: 'cancelled' },
        id: { not: parseInt(bookingId) },
        OR: [
          {
            AND: [{ startTime: { lte: newStartTime } }, { endTime: { gt: newStartTime } }],
          },
          {
            AND: [{ startTime: { lt: newEndTime } }, { endTime: { gte: newEndTime } }],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'New time slot is already booked',
      });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        bookingDate: new Date(newDate),
        startTime: newStartTime,
        endTime: newEndTime,
        updatedAt: new Date(),
      },
      include: {
        venue: { select: { name: true } },
        court: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error.message,
    });
  }
};
