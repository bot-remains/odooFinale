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
        bookings,
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
    const { venueId, courtId, bookingDate, startTime, endTime, duration } = req.body;
    const userId = req.user.id;

    // Check if court exists and is available
    const court = await prisma.court.findFirst({
      where: {
        id: parseInt(courtId),
        venueId: parseInt(venueId),
        isActive: true,
      },
      include: {
        venue: {
          select: {
            name: true,
            pricePerHour: true,
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

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        courtId: parseInt(courtId),
        bookingDate: new Date(bookingDate),
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
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

    // Calculate total amount
    const totalAmount = court.venue.pricePerHour * (parseInt(duration) / 60);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: userId,
        venueId: parseInt(venueId),
        courtId: parseInt(courtId),
        bookingDate: new Date(bookingDate),
        startTime: startTime,
        endTime: endTime,
        duration: parseInt(duration),
        totalAmount: totalAmount,
        status: 'pending',
      },
      include: {
        venue: { select: { name: true } },
        court: { select: { name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
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
