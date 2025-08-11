import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getAdminDashboard,
  getAllVenuesForReview,
  reviewVenue,
  getAllUsers,
  updateUserStatus,
  getSystemReports,
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin Dashboard
router.get('/dashboard', getAdminDashboard);

// Venue Management
router.get(
  '/venues',
  [
    query('status').optional().isIn(['pending', 'approved', 'all']),
    query('search').optional().isString().trim(),
    query('location').optional().isString().trim(),
    query('sortBy').optional().isIn(['created_at', 'name', 'location', 'rating']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  getAllVenuesForReview
);

// Approve or reject venue
router.patch(
  '/venues/:venueId/review',
  [
    param('venueId').isInt(),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('rejectionReason').optional().isString().trim().isLength({ min: 10, max: 500 }),
  ],
  reviewVenue
);

// User Management
router.get(
  '/users',
  [
    query('role').optional().isIn(['user', 'facility_owner']),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(['active', 'inactive', 'all']),
    query('sortBy').optional().isIn(['created_at', 'name', 'email', 'last_login']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  getAllUsers
);

// Suspend or activate user
router.patch(
  '/users/:userId/status',
  [
    param('userId').isInt(),
    body('action').isIn(['suspend', 'activate']).withMessage('Action must be suspend or activate'),
    body('reason').optional().isString().trim().isLength({ max: 500 }),
  ],
  updateUserStatus
);

// System Reports
router.get(
  '/reports',
  [
    query('reportType')
      .isIn(['bookings', 'venues', 'revenue', 'users'])
      .withMessage('Valid report type is required'),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  getSystemReports
);

export default router;
