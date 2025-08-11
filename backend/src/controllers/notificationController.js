import { validationResult } from 'express-validator';

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, isRead, limit = 20, offset = 0 } = req.query;

    const { query } = await import('../config/database.js');

    // Build filters
    let whereClause = 'WHERE n.user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (type) {
      whereClause += ` AND n.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (isRead !== undefined) {
      whereClause += ` AND n.is_read = $${paramCount}`;
      params.push(isRead === 'true');
      paramCount++;
    }

    params.push(limit, offset);

    const notificationsQuery = `
      SELECT
        n.*,
        CASE
          WHEN n.type IN ('booking_confirmed', 'booking_cancelled', 'booking_rescheduled') THEN (
            SELECT json_build_object(
              'booking_id', b.id,
              'venue_name', v.name,
              'court_name', c.name,
              'booking_date', b.booking_date,
              'start_time', b.start_time
            )
            FROM bookings b
            JOIN courts c ON b.court_id = c.id
            JOIN venues v ON c.venue_id = v.id
            WHERE b.id = n.related_id
          )
          WHEN n.type = 'venue_approved' THEN (
            SELECT json_build_object(
              'venue_id', v.id,
              'venue_name', v.name,
              'location', v.location
            )
            FROM venues v
            WHERE v.id = n.related_id
          )
          ELSE NULL
        END as related_data
      FROM notifications n
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const notificationsResult = await query(notificationsQuery, params);

    // Get unread count
    const unreadCountQuery = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;
    const unreadResult = await query(unreadCountQuery, [userId]);

    res.json({
      success: true,
      data: {
        notifications: notificationsResult.rows,
        unreadCount: parseInt(unreadResult.rows[0].unread_count),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const { query } = await import('../config/database.js');

    // Update notification
    const updateResult = await query(
      'UPDATE notifications SET is_read = true, read_at = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [new Date(), notificationId, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const { query } = await import('../config/database.js');

    await query(
      'UPDATE notifications SET is_read = true, read_at = $1 WHERE user_id = $2 AND is_read = false',
      [new Date(), userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const { query } = await import('../config/database.js');

    const deleteResult = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [notificationId, userId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

// Create notification (internal use)
export const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    const { query } = await import('../config/database.js');

    const notification = await query(
      `INSERT INTO notifications (user_id, type, title, message, related_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, title, message, relatedId, new Date()]
    );

    return notification.rows[0];
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Send booking confirmation notification
export const sendBookingConfirmationNotification = async (booking) => {
  try {
    await createNotification(
      booking.user_id,
      'booking_confirmed',
      'Booking Confirmed',
      `Your booking for ${booking.venue_name} - ${booking.court_name} on ${booking.booking_date} has been confirmed.`,
      booking.id
    );

    // Also notify venue owner
    await createNotification(
      booking.owner_id,
      'new_booking',
      'New Booking Received',
      `You have a new booking for ${booking.court_name} on ${booking.booking_date} from ${booking.user_name}.`,
      booking.id
    );

    // TODO: Send email notifications
  } catch (error) {
    console.error('Send booking confirmation notification error:', error);
  }
};

// Send booking cancellation notification
export const sendBookingCancellationNotification = async (booking) => {
  try {
    await createNotification(
      booking.user_id,
      'booking_cancelled',
      'Booking Cancelled',
      `Your booking for ${booking.venue_name} - ${booking.court_name} on ${booking.booking_date} has been cancelled.`,
      booking.id
    );

    // Also notify venue owner
    await createNotification(
      booking.owner_id,
      'booking_cancelled',
      'Booking Cancelled',
      `A booking for ${booking.court_name} on ${booking.booking_date} has been cancelled by ${booking.user_name}.`,
      booking.id
    );

    // TODO: Send email notifications
  } catch (error) {
    console.error('Send booking cancellation notification error:', error);
  }
};

// Send venue approval notification
export const sendVenueApprovalNotification = async (venue) => {
  try {
    await createNotification(
      venue.owner_id,
      'venue_approved',
      'Venue Approved',
      `Congratulations! Your venue "${venue.name}" has been approved and is now live on our platform.`,
      venue.id
    );

    // TODO: Send email notification
  } catch (error) {
    console.error('Send venue approval notification error:', error);
  }
};

// Send venue rejection notification
export const sendVenueRejectionNotification = async (venue) => {
  try {
    await createNotification(
      venue.owner_id,
      'venue_rejected',
      'Venue Application Rejected',
      `Your venue application for "${venue.name}" has been rejected. Reason: ${venue.rejection_reason}`,
      venue.id
    );

    // TODO: Send email notification
  } catch (error) {
    console.error('Send venue rejection notification error:', error);
  }
};

// Send reminder notifications
export const sendBookingReminders = async () => {
  try {
    const { query } = await import('../config/database.js');

    // Get bookings that are 24 hours away
    const reminderQuery = `
      SELECT
        b.*,
        u.name as user_name,
        u.email as user_email,
        v.name as venue_name,
        c.name as court_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN courts c ON b.court_id = c.id
      JOIN venues v ON c.venue_id = v.id
      WHERE b.status = 'confirmed'
        AND b.booking_date = CURRENT_DATE + INTERVAL '1 day'
        AND b.start_time BETWEEN CURRENT_TIME AND CURRENT_TIME + INTERVAL '1 hour'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = b.user_id
            AND n.type = 'booking_reminder'
            AND n.related_id = b.id
        )
    `;

    const remindersResult = await query(reminderQuery);

    for (const booking of remindersResult.rows) {
      await createNotification(
        booking.user_id,
        'booking_reminder',
        'Booking Reminder',
        `Reminder: You have a booking for ${booking.venue_name} - ${booking.court_name} tomorrow at ${booking.start_time}.`,
        booking.id
      );

      // TODO: Send email reminder
    }

    console.log(`Sent ${remindersResult.rows.length} booking reminders`);
  } catch (error) {
    console.error('Send booking reminders error:', error);
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const { query } = await import('../config/database.js');

    const preferencesQuery = `
      SELECT * FROM notification_preferences
      WHERE user_id = $1
    `;

    const result = await query(preferencesQuery, [userId]);

    // If no preferences exist, return defaults
    if (result.rows.length === 0) {
      const defaultPreferences = {
        email_bookings: true,
        email_reminders: true,
        email_promotions: false,
        push_bookings: true,
        push_reminders: true,
        push_promotions: false,
        sms_bookings: false,
        sms_reminders: true,
      };

      res.json({
        success: true,
        data: defaultPreferences,
      });
    } else {
      res.json({
        success: true,
        data: result.rows[0],
      });
    }
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message,
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const preferences = req.body;

    const { query } = await import('../config/database.js');

    // Check if preferences exist
    const existingQuery = `
      SELECT id FROM notification_preferences WHERE user_id = $1
    `;
    const existingResult = await query(existingQuery, [userId]);

    if (existingResult.rows.length === 0) {
      // Create new preferences
      const insertQuery = `
        INSERT INTO notification_preferences
        (user_id, email_bookings, email_reminders, email_promotions,
         push_bookings, push_reminders, push_promotions,
         sms_bookings, sms_reminders, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const insertResult = await query(insertQuery, [
        userId,
        preferences.email_bookings,
        preferences.email_reminders,
        preferences.email_promotions,
        preferences.push_bookings,
        preferences.push_reminders,
        preferences.push_promotions,
        preferences.sms_bookings,
        preferences.sms_reminders,
        new Date(),
      ]);

      res.json({
        success: true,
        message: 'Notification preferences created successfully',
        data: insertResult.rows[0],
      });
    } else {
      // Update existing preferences
      const updateQuery = `
        UPDATE notification_preferences
        SET email_bookings = $2, email_reminders = $3, email_promotions = $4,
            push_bookings = $5, push_reminders = $6, push_promotions = $7,
            sms_bookings = $8, sms_reminders = $9, updated_at = $10
        WHERE user_id = $1
        RETURNING *
      `;

      const updateResult = await query(updateQuery, [
        userId,
        preferences.email_bookings,
        preferences.email_reminders,
        preferences.email_promotions,
        preferences.push_bookings,
        preferences.push_reminders,
        preferences.push_promotions,
        preferences.sms_bookings,
        preferences.sms_reminders,
        new Date(),
      ]);

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: updateResult.rows[0],
      });
    }
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message,
    });
  }
};
