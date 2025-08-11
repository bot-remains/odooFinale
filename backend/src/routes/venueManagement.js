import express from 'express';
import { body, param, query } from 'express-validator';
import { getDashboard } from '../controllers/venueController.js';
import {
  getVenues,
  createVenue,
  getVenue,
  updateVenue,
  deleteVenue,
} from '../controllers/venueController.js';
import {
  getCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  toggleCourtStatus,
} from '../controllers/courtController.js';
import {
  getBlockedSlots,
  blockTimeSlots,
  unblockTimeSlots,
} from '../controllers/timeSlotController.js';
import { getBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and venue owner role check to all routes
router.use(authenticate);
router.use(requireRole(['facility_owner', 'admin']));

// DASHBOARD
router.get('/dashboard', getDashboard);

// VENUE MANAGEMENT
router.get('/venues', getVenues);

router.post(
  '/venues',
  [
    body('name')
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Venue name must be between 3 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('address')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Address must be between 10 and 500 characters'),
    body('location')
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Location must be between 3 and 255 characters'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array'),
    body('amenities.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Each amenity must be between 1 and 100 characters'),
    body('photos').optional().isArray().withMessage('Photos must be an array'),
    body('photos.*').optional().isURL().withMessage('Each photo must be a valid URL'),
    body('courts').optional().isArray().withMessage('Courts must be an array'),
    body('courts.*.name')
      .if(body('courts').exists())
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Court name must be between 1 and 100 characters'),
    body('courts.*.sportType')
      .if(body('courts').exists())
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Sport type must be between 3 and 50 characters'),
    body('courts.*.pricePerHour')
      .if(body('courts').exists())
      .isNumeric()
      .withMessage('Price per hour must be a number'),
    body('courts.*.description')
      .if(body('courts').exists())
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Court description must not exceed 500 characters'),
  ],
  createVenue
);

router.get(
  '/venues/:venueId',
  [param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID')],
  getVenue
);

router.put(
  '/venues/:venueId',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Venue name must be between 3 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('address')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Address must be between 10 and 500 characters'),
    body('location')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Location must be between 3 and 255 characters'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array'),
    body('photos').optional().isArray().withMessage('Photos must be an array'),
  ],
  updateVenue
);

router.delete(
  '/venues/:venueId',
  [param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID')],
  deleteVenue
);

// COURT MANAGEMENT
router.get(
  '/venues/:venueId/courts',
  [param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID')],
  getCourts
);

router.post(
  '/venues/:venueId/courts',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    body('name')
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Court name must be between 3 and 255 characters'),
    body('sportType')
      .trim()
      .isIn([
        'badminton',
        'tennis',
        'squash',
        'basketball',
        'football',
        'cricket',
        'table_tennis',
        'volleyball',
      ])
      .withMessage('Invalid sport type'),
    body('pricePerHour')
      .isFloat({ min: 0.01 })
      .withMessage('Price per hour must be a positive number'),
    body('operatingHours').optional().isObject().withMessage('Operating hours must be an object'),
    body('operatingHours.start')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format'),
    body('operatingHours.end')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:MM format'),
  ],
  createCourt
);

router.put(
  '/venues/:venueId/courts/:courtId',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    param('courtId').isInt({ min: 1 }).withMessage('Invalid court ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Court name must be between 3 and 255 characters'),
    body('sportType')
      .optional()
      .trim()
      .isIn([
        'badminton',
        'tennis',
        'squash',
        'basketball',
        'football',
        'cricket',
        'table_tennis',
        'volleyball',
      ])
      .withMessage('Invalid sport type'),
    body('pricePerHour')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Price per hour must be a positive number'),
    body('operatingHours').optional().isObject().withMessage('Operating hours must be an object'),
  ],
  updateCourt
);

router.delete(
  '/venues/:venueId/courts/:courtId',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    param('courtId').isInt({ min: 1 }).withMessage('Invalid court ID'),
  ],
  deleteCourt
);

router.patch(
  '/venues/:venueId/courts/:courtId/toggle-status',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    param('courtId').isInt({ min: 1 }).withMessage('Invalid court ID'),
  ],
  toggleCourtStatus
);

// TIME SLOT MANAGEMENT
router.get(
  '/venues/:venueId/courts/:courtId/blocked-slots',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    param('courtId').isInt({ min: 1 }).withMessage('Invalid court ID'),
    query('dayOfWeek')
      .optional()
      .isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be 0-6 (Sunday-Saturday)'),
  ],
  getBlockedSlots
);

router.post(
  '/venues/:venueId/courts/:courtId/block-slots',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    param('courtId').isInt({ min: 1 }).withMessage('Invalid court ID'),
    body('slotIds').isArray({ min: 1 }).withMessage('Slot IDs must be a non-empty array'),
    body('slotIds.*').isInt({ min: 1 }).withMessage('Each slot ID must be a valid integer'),
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Reason must be between 3 and 255 characters'),
  ],
  blockTimeSlots
);

router.post(
  '/venues/:venueId/courts/:courtId/unblock-slots',
  [
    param('venueId').isInt({ min: 1 }).withMessage('Invalid venue ID'),
    param('courtId').isInt({ min: 1 }).withMessage('Invalid court ID'),
    body('slotIds').isArray({ min: 1 }).withMessage('Slot IDs must be a non-empty array'),
    body('slotIds.*').isInt({ min: 1 }).withMessage('Each slot ID must be a valid integer'),
  ],
  unblockTimeSlots
);

// BOOKING MANAGEMENT
router.get(
  '/bookings',
  [
    query('status')
      .optional()
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Invalid status'),
    query('venueId').optional().isInt({ min: 1 }).withMessage('Invalid venue ID'),
    query('courtId').optional().isInt({ min: 1 }).withMessage('Invalid court ID'),
    query('date').optional().isDate().withMessage('Date must be in YYYY-MM-DD format'),
    query('startDate').optional().isDate().withMessage('Start date must be in YYYY-MM-DD format'),
    query('endDate').optional().isDate().withMessage('End date must be in YYYY-MM-DD format'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer'),
  ],
  getBookings
);

router.patch(
  '/bookings/:bookingId/status',
  [
    param('bookingId').isInt({ min: 1 }).withMessage('Invalid booking ID'),
    body('status')
      .isIn(['confirmed', 'cancelled'])
      .withMessage('Status must be confirmed or cancelled'),
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Reason must be between 3 and 255 characters'),
  ],
  updateBookingStatus
);

export default router;
