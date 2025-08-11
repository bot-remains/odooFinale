# SQL to Prisma Migration Guide

This document outlines the complete migration from raw SQL queries to Prisma ORM for the QuickCourt backend.

## Migration Overview

### ✅ Completed

- **Prisma Schema**: Complete schema with all models defined
- **Prisma Client**: Generated and configured
- **Model Classes**: All major models converted to Prisma
- **Database Configuration**: New Prisma-based database connection

### 🔄 Models Converted

- `UserPrisma.js` - User management with authentication
- `VenuePrisma.js` - Venue management with approval system
- `BookingPrisma.js` - Booking system with conflict checking
- `ReviewPrisma.js` - Review system with helpful voting
- `CourtPrisma.js` - Court management with availability
- `TimeSlotPrisma.js` - Time slot management

### 🎯 Controllers Ready for Migration

- `authControllerPrisma.js` - Authentication endpoints (example)

## Key Changes from SQL to Prisma

### 1. Database Connection

**Before (SQL):**

```javascript
import { query } from '../config/database.js';
const result = await query('SELECT * FROM users WHERE id = $1', [id]);
```

**After (Prisma):**

```javascript
import prisma from '../config/prisma.js';
const user = await prisma.user.findUnique({ where: { id } });
```

### 2. Model Creation

**Before (SQL):**

```javascript
const insertQuery = `
  INSERT INTO users (name, email, password, role)
  VALUES ($1, $2, $3, $4)
  RETURNING *
`;
const result = await query(insertQuery, [name, email, hashedPassword, role]);
```

**After (Prisma):**

```javascript
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role,
  },
});
```

### 3. Complex Queries with Relations

**Before (SQL):**

```javascript
const selectQuery = `
  SELECT v.*, u.name as owner_name, u.email as owner_email
  FROM venues v
  LEFT JOIN users u ON v.owner_id = u.id
  WHERE v.id = $1
`;
```

**After (Prisma):**

```javascript
const venue = await prisma.venue.findUnique({
  where: { id },
  include: {
    owner: {
      select: {
        name: true,
        email: true,
      },
    },
  },
});
```

### 4. Aggregations and Statistics

**Before (SQL):**

```javascript
const statsQuery = `
  SELECT
    COUNT(*) as total_bookings,
    SUM(total_amount) as total_revenue
  FROM bookings
  WHERE venue_id = $1
`;
```

**After (Prisma):**

```javascript
const stats = await prisma.booking.aggregate({
  where: { venueId },
  _count: { id: true },
  _sum: { totalAmount: true },
});
```

## Migration Strategy

### Phase 1: Setup ✅

1. Install Prisma packages
2. Create Prisma schema
3. Generate Prisma client
4. Create new model classes

### Phase 2: Gradual Controller Migration 🔄

Use the migration helper to switch controllers one by one:

```bash
# Check migration status
npm run migrate status

# Switch auth controller to Prisma
npm run migrate switch auth

# Test thoroughly, then move to next controller
npm run migrate switch venue

# If issues found, switch back
npm run migrate switch auth back
```

### Phase 3: Testing and Validation

1. Test each converted controller thoroughly
2. Verify all endpoints work correctly
3. Check performance compared to SQL
4. Validate data integrity

### Phase 4: Cleanup

1. Remove old model files
2. Remove old database configuration
3. Update documentation

## Benefits of Prisma Migration

### 1. Type Safety

```javascript
// Prisma provides full TypeScript support and autocomplete
const user = await prisma.user.create({
  data: {
    name: 'John',
    email: 'john@example.com',
    // IDE will suggest available fields and catch typos
  },
});
```

### 2. Relationship Handling

```javascript
// Easy to include related data
const venue = await prisma.venue.findMany({
  include: {
    owner: true,
    courts: true,
    reviews: {
      include: {
        user: true,
      },
    },
  },
});
```

### 3. Query Building

```javascript
// Complex where conditions made simple
const venues = await prisma.venue.findMany({
  where: {
    isApproved: true,
    rating: { gte: 4.0 },
    location: { contains: 'Mumbai', mode: 'insensitive' },
    courts: {
      some: {
        sportType: 'tennis',
        isActive: true,
      },
    },
  },
});
```

### 4. Transaction Support

```javascript
// Easy transaction handling
await prisma.$transaction(async (tx) => {
  const booking = await tx.booking.create({ data: bookingData });
  await tx.user.update({
    where: { id: userId },
    data: { lastBooking: new Date() },
  });
});
```

## Performance Considerations

### Query Optimization

- Use `select` to limit returned fields
- Use `include` carefully to avoid N+1 problems
- Implement proper indexing in schema

### Connection Pooling

- Prisma handles connection pooling automatically
- Configure pool size in DATABASE_URL if needed

### Caching

- Consider implementing Redis caching for frequently accessed data
- Use Prisma's query result caching features

## Troubleshooting

### Common Issues

1. **Type mismatches**: Ensure data types match Prisma schema
2. **Missing relations**: Verify foreign key relationships
3. **Date handling**: Use proper Date objects for DateTime fields
4. **Enum values**: Use string values that match schema enums

### Migration Rollback

If issues occur, you can quickly rollback:

```bash
# Switch specific controller back to SQL
npm run migrate switch auth back

# Or temporarily switch imports in index.js back to old database config
```

## Next Steps

1. **Start with Auth Controller**: Begin migration with authentication
2. **Test Thoroughly**: Ensure all auth endpoints work correctly
3. **Move to Venue Controller**: Continue with venue management
4. **Progressive Migration**: One controller at a time
5. **Monitor Performance**: Compare with SQL performance
6. **Document Changes**: Update API documentation as needed

## Command Reference

```bash
# Database operations
npm run prisma:generate    # Regenerate Prisma client
npm run prisma:push       # Push schema changes to database
npm run prisma:studio     # Open Prisma Studio GUI

# Migration helper
npm run migrate status    # Show migration status
npm run migrate switch <controller>  # Switch to Prisma
npm run migrate switch <controller> back  # Revert to SQL
npm run migrate help     # Show help

# Development
npm run dev              # Start development server
npm start               # Start production server
```

The migration is designed to be safe, gradual, and reversible. Start with one controller, test thoroughly, then proceed to the next. The old SQL-based system remains functional until the complete migration is verified.
