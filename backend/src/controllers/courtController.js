import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import { validationResult } from 'express-validator';

// Helper function to verify venue ownership
const verifyVenueOwnership = async (venueId, userId) => {
  const venue = await Venue.findById(venueId);
  if (!venue || venue.ownerId !== userId) {
    return null;
  }
  return venue;
};

// Get courts for a specific venue
export const getCourts = async (req, res) => {
  try {
    const { venueId } = req.params;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const courts = await Court.findByVenue(venueId);

    res.json({
      success: true,
      data: courts.map((court) => court.toJSON()),
    });
  } catch (error) {
    console.error('Get courts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courts',
      error: error.message,
    });
  }
};

// Create a new court
export const createCourt = async (req, res) => {
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

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const courtData = {
      ...req.body,
      venueId: parseInt(venueId),
    };

    const court = await Court.create(courtData);

    res.status(201).json({
      success: true,
      message: 'Court created successfully',
      data: court.toJSON(),
    });
  } catch (error) {
    console.error('Create court error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create court',
      error: error.message,
    });
  }
};

// Update a court
export const updateCourt = async (req, res) => {
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

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const court = await Court.findById(courtId);
    if (!court || court.venueId !== parseInt(venueId)) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    const updatedCourt = await court.update(req.body);

    res.json({
      success: true,
      message: 'Court updated successfully',
      data: updatedCourt.toJSON(),
    });
  } catch (error) {
    console.error('Update court error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update court',
      error: error.message,
    });
  }
};

// Delete a court
export const deleteCourt = async (req, res) => {
  try {
    const { venueId, courtId } = req.params;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const court = await Court.findById(courtId);
    if (!court || court.venueId !== parseInt(venueId)) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    await court.delete();

    res.json({
      success: true,
      message: 'Court deleted successfully',
    });
  } catch (error) {
    console.error('Delete court error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete court',
      error: error.message,
    });
  }
};

// Toggle court active status
export const toggleCourtStatus = async (req, res) => {
  try {
    const { venueId, courtId } = req.params;

    // Verify venue ownership
    const venue = await verifyVenueOwnership(venueId, req.user.id);
    if (!venue) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const court = await Court.findById(courtId);
    if (!court || court.venueId !== parseInt(venueId)) {
      return res.status(404).json({
        success: false,
        message: 'Court not found',
      });
    }

    const updatedCourt = await court.update({ isActive: !court.isActive });

    res.json({
      success: true,
      message: `Court ${updatedCourt.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedCourt.toJSON(),
    });
  } catch (error) {
    console.error('Toggle court status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update court status',
      error: error.message,
    });
  }
};
