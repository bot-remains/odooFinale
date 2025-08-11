import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getAdminDashboard,
  getAllVenuesForReview,
  reviewVenue,
  getAllUsers,
  updateUserStatus,
  getSystemReports,
  getChartData,
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin']));

// Admin Dashboard
router.get('/dashboard', getAdminDashboard);

// Get chart data for dashboard
router.get(
  '/chart-data',
  [query('type').optional().isIn(['monthly', 'sports', 'venues'])],
  getChartData
);

// 1. Facility owner/user management - show list and ban/unban
router.get(
  '/users',
  [
    query('role').optional().isIn(['user', 'facility_owner']),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(['active', 'inactive', 'all']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  getAllUsers
);

// Ban/Unban users
router.patch(
  '/users/:userId/status',
  [
    param('userId').isInt(),
    body('action').isIn(['suspend', 'activate']).withMessage('Action must be suspend or activate'),
    body('reason').optional().isString().trim().isLength({ max: 500 }),
  ],
  updateUserStatus
);

// 2. Accept/reject facility requests
router.get(
  '/venues',
  [
    query('status').optional().isIn(['pending', 'approved', 'all']),
    query('search').optional().isString().trim(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  getAllVenuesForReview
);

// Approve or reject venue requests
router.patch(
  '/venues/:venueId/review',
  [
    param('venueId').isInt(),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('rejectionReason').optional().isString().trim().isLength({ min: 10, max: 500 }),
  ],
  reviewVenue
);

// 3. See all reports submitted by users for venues/courts
router.get(
  '/reports',
  [
    query('reportType')
      .optional()
      .isIn(['venues', 'users', 'bookings'])
      .withMessage('Valid report type: venues, users, or bookings'),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  getSystemReports
);

export default router;
