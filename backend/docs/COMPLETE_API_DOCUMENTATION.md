# QuickCourt API Documentation - Complete Platform

## Overview

QuickCourt is a comprehensive sports booking platform that connects customers with local sports facilities. This documentation covers all the APIs for the complete platform functionality.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using Bearer tokens:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Authentication (`/api/auth`)

#### Register User

```http
POST /api/auth/register
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "user" // or "facility_owner", "admin"
}
```

#### Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Public API (`/api/public`)

#### Get All Venues

```http
GET /api/public/venues?search=downtown&location=city&sportType=basketball&minRating=4&maxPrice=50&sortBy=rating&limit=20
```

#### Get Venue Details

```http
GET /api/public/venues/{venueId}?date=2024-12-20
```

#### Get Courts by Sport

```http
GET /api/public/sports/{sportType}/courts?location=downtown&date=2024-12-20&startTime=14:00&endTime=16:00
```

#### Get Popular Venues

```http
GET /api/public/venues/popular/list?type=rating&limit=10
```

#### Get Available Sports

```http
GET /api/public/sports
```

### 3. Venue Management (`/api/venue-management`) 🔒 Owner/Admin

#### Get Dashboard

```http
GET /api/venue-management/dashboard
```

#### Create Venue

```http
POST /api/venue-management/venues
```

**Body:**

```json
{
  "name": "Downtown Sports Complex",
  "description": "Premium sports facility",
  "location": "Downtown City",
  "address": "123 Main Street",
  "contactPhone": "+1234567890",
  "contactEmail": "info@venue.com",
  "amenities": ["parking", "wifi", "restrooms"],
  "operatingHours": {
    "monday": { "open": "06:00", "close": "22:00" }
  }
}
```

#### Create Court

```http
POST /api/venue-management/courts
```

**Body:**

```json
{
  "venueId": 1,
  "name": "Basketball Court A",
  "sportType": "basketball",
  "description": "Professional court",
  "pricePerHour": 25.0,
  "capacity": 10
}
```

#### Block Time Slots

```http
POST /api/venue-management/time-slots/block
```

**Body:**

```json
{
  "courtId": 1,
  "date": "2024-12-20",
  "startTime": "14:00",
  "endTime": "16:00",
  "reason": "Maintenance"
}
```

### 4. Customer Bookings (`/api/bookings`) 🔒 User

#### Get User Bookings

```http
GET /api/bookings?status=confirmed&upcoming=true&limit=20
```

#### Create Booking

```http
POST /api/bookings
```

**Body:**

```json
{
  "courtId": 1,
  "bookingDate": "2024-12-20",
  "startTime": "14:00",
  "endTime": "15:00",
  "notes": "Team practice",
  "totalAmount": 25.0
}
```

#### Cancel Booking

```http
PATCH /api/bookings/{bookingId}/cancel
```

**Body:**

```json
{
  "reason": "Schedule conflict"
}
```

#### Reschedule Booking

```http
PATCH /api/bookings/{bookingId}/reschedule
```

**Body:**

```json
{
  "newDate": "2024-12-21",
  "newStartTime": "15:00",
  "newEndTime": "16:00"
}
```

### 5. Reviews & Ratings (`/api/reviews`)

#### Get Venue Reviews (Public)

```http
GET /api/reviews/venues/{venueId}?rating=5&sortBy=created_at&limit=20
```

#### Create Review 🔒

```http
POST /api/reviews
```

**Body:**

```json
{
  "venueId": 1,
  "bookingId": 1,
  "courtId": 1,
  "rating": 5,
  "comment": "Excellent facility!"
}
```

#### Get User Reviews 🔒

```http
GET /api/reviews/my-reviews
```

#### Mark Review as Helpful 🔒

```http
POST /api/reviews/{reviewId}/helpful
```

### 6. Payments (`/api/payments`) 🔒 User

#### Create Payment Intent

```http
POST /api/payments/create-intent
```

**Body:**

```json
{
  "bookingId": 1,
  "amount": 25.0
}
```

#### Confirm Payment

```http
POST /api/payments/confirm
```

**Body:**

```json
{
  "paymentIntentId": "pi_1234567890"
}
```

#### Get Payment History

```http
GET /api/payments/history?limit=20
```

#### Process Refund

```http
POST /api/payments/refund/{bookingId}
```

**Body:**

```json
{
  "reason": "Booking cancellation",
  "amount": 12.5
}
```

### 7. Notifications (`/api/notifications`) 🔒 User

#### Get Notifications

```http
GET /api/notifications?type=booking_confirmed&isRead=false&limit=20
```

#### Mark Notification as Read

```http
PATCH /api/notifications/{notificationId}/read
```

#### Mark All as Read

```http
PATCH /api/notifications/mark-all-read
```

#### Get Notification Preferences

```http
GET /api/notifications/preferences
```

#### Update Notification Preferences

```http
PUT /api/notifications/preferences
```

**Body:**

```json
{
  "email_bookings": true,
  "email_reminders": true,
  "email_promotions": false,
  "push_bookings": true,
  "push_reminders": true,
  "push_promotions": false,
  "sms_bookings": false,
  "sms_reminders": true
}
```

### 8. Admin Panel (`/api/admin`) 🔒 Admin

#### Get Admin Dashboard

```http
GET /api/admin/dashboard
```

#### Get Venues for Review

```http
GET /api/admin/venues?status=pending&search=downtown&limit=20
```

#### Approve/Reject Venue

```http
PATCH /api/admin/venues/{venueId}/review
```

**Body:**

```json
{
  "action": "approve", // or "reject"
  "rejectionReason": "Missing required documents"
}
```

#### Get All Users

```http
GET /api/admin/users?role=user&search=john&status=active&limit=20
```

#### Suspend/Activate User

```http
PATCH /api/admin/users/{userId}/status
```

**Body:**

```json
{
  "action": "suspend", // or "activate"
  "reason": "Terms violation"
}
```

#### Get System Reports

```http
GET /api/admin/reports?reportType=bookings&startDate=2024-12-01&endDate=2024-12-31
```

## Data Models

### User

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-12-15T10:00:00Z"
}
```

### Venue

```json
{
  "id": 1,
  "name": "Downtown Sports Complex",
  "description": "Premium sports facility",
  "location": "Downtown City",
  "address": "123 Main Street",
  "contactPhone": "+1234567890",
  "contactEmail": "info@venue.com",
  "amenities": ["parking", "wifi"],
  "rating": 4.5,
  "totalReviews": 150,
  "isApproved": true,
  "createdAt": "2024-12-15T10:00:00Z"
}
```

### Court

```json
{
  "id": 1,
  "venueId": 1,
  "name": "Basketball Court A",
  "sportType": "basketball",
  "description": "Professional court",
  "pricePerHour": 25.0,
  "capacity": 10,
  "isActive": true,
  "createdAt": "2024-12-15T10:00:00Z"
}
```

### Booking

```json
{
  "id": 1,
  "userId": 1,
  "courtId": 1,
  "bookingDate": "2024-12-20",
  "startTime": "14:00",
  "endTime": "15:00",
  "totalAmount": 25.0,
  "status": "confirmed",
  "notes": "Team practice",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

### Review

```json
{
  "id": 1,
  "userId": 1,
  "venueId": 1,
  "bookingId": 1,
  "rating": 5,
  "comment": "Excellent facility!",
  "helpfulCount": 5,
  "createdAt": "2024-12-15T10:00:00Z"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

## Pagination

Most list endpoints support pagination:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasNext": true
    }
  }
}
```

## Notification Types

- `booking_confirmed` - Booking confirmed
- `booking_cancelled` - Booking cancelled
- `booking_reminder` - Booking reminder
- `venue_approved` - Venue approved
- `venue_rejected` - Venue rejected
- `new_booking` - New booking (for owners)

## Booking Statuses

- `pending` - Awaiting payment
- `confirmed` - Paid and confirmed
- `cancelled` - Cancelled by user
- `completed` - Booking completed

## Venue Approval Status

- `pending` - Awaiting admin approval
- `approved` - Approved and live
- `rejected` - Rejected by admin

## Usage Examples

### Complete Booking Flow

1. **Discover Venues**

   ```http
   GET /api/public/venues?location=downtown&sportType=basketball
   ```

2. **Check Availability**

   ```http
   GET /api/public/venues/1?date=2024-12-20
   ```

3. **Create Booking**

   ```http
   POST /api/bookings
   ```

4. **Process Payment**

   ```http
   POST /api/payments/create-intent
   POST /api/payments/confirm
   ```

5. **Leave Review**
   ```http
   POST /api/reviews
   ```

### Venue Owner Flow

1. **Create Venue**

   ```http
   POST /api/venue-management/venues
   ```

2. **Add Courts**

   ```http
   POST /api/venue-management/courts
   ```

3. **Manage Bookings**

   ```http
   GET /api/venue-management/bookings
   ```

4. **Block Time Slots**
   ```http
   POST /api/venue-management/time-slots/block
   ```

This completes the comprehensive sports booking platform with all major functionalities including venue management, customer booking, payments, reviews, notifications, and admin panel.
