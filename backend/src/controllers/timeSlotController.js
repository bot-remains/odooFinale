import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import TimeSlot from '../models/TimeSlot.js';
import { validationResult } from 'express-validator';

// Helper function to verify venue ownership through court
const verifyCourtOwnership = async (venueId, courtId, userId) => {
  const venue = await Venue.findById(venueId);
  if (!venue || venue.ownerId !== userId) {
    return null;
  }

  const court = await Court.findById(courtId);
  if (!court || court.venueId !== parseInt(venueId)) {
    return null;
  }

  return { venue, court };
};

// Get blocked time slots for a court
export const getBlockedSlots = async (req, res) => {
  try {
    const { venueId, courtId } = req.params;
    const { date, startDate, endDate } = req.query;

    // Verify ownership
    const ownership = await verifyCourtOwnership(venueId, courtId, req.user.id);
    if (!ownership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    let blockedSlots;
    if (date) {
      blockedSlots = await TimeSlot.getBlockedSlots(courtId, date);
    } else {
      // Get blocked slots for a date range
      const { query } = await import('../config/database.js');
      const dateRangeQuery = `
        SELECT * FROM time_slots
        WHERE court_id = $1
          AND is_blocked = true
          AND date BETWEEN $2 AND $3
        ORDER BY date, start_time
      `;
      const start = startDate || new Date().toISOString().split('T')[0];
      const end =
        endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await query(dateRangeQuery, [courtId, start, end]);
      blockedSlots = result.rows.map((row) => new TimeSlot(row));
    }

    res.json({
      success: true,
      data: blockedSlots.map((slot) => slot.toJSON()),
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
    const { slots, reason } = req.body; // slots: [{ date, startTime, endTime }, ...]

    // Verify ownership
    const ownership = await verifyCourtOwnership(venueId, courtId, req.user.id);
    if (!ownership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const blockedSlots = [];
    for (const slot of slots) {
      const blockedSlot = await TimeSlot.blockSlot(
        courtId,
        slot.date,
        slot.startTime,
        slot.endTime,
        reason
      );
      blockedSlots.push(blockedSlot);
    }

    res.json({
      success: true,
      message: `${blockedSlots.length} time slot(s) blocked successfully`,
      data: blockedSlots.map((slot) => slot.toJSON()),
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
    const { venueId, courtId } = req.params;
    const { slots } = req.body; // slots: [{ date, startTime, endTime }, ...]

    // Verify ownership
    const ownership = await verifyCourtOwnership(venueId, courtId, req.user.id);
    if (!ownership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const unblockedSlots = [];
    for (const slot of slots) {
      const unblockedSlot = await TimeSlot.unblockSlot(
        courtId,
        slot.date,
        slot.startTime,
        slot.endTime
      );
      if (unblockedSlot) {
        unblockedSlots.push(unblockedSlot);
      }
    }

    res.json({
      success: true,
      message: `${unblockedSlots.length} time slot(s) unblocked successfully`,
      data: unblockedSlots.map((slot) => slot.toJSON()),
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
