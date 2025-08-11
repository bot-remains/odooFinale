# QuickCourt Project Structure

## 📁 Root Directory

```
odooFinale/
├── backend/           # Node.js Express API server
├── frontend/          # React.js client application
├── package.json       # Root package.json for scripts
├── start.sh          # Linux/Mac startup script
├── start.bat         # Windows startup script
└── README.md         # Project documentation
```

## 🔙 Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── config/           # Database and app configuration
│   │   ├── database.js   # Legacy database config
│   │   └── prisma.js     # Prisma client setup
│   ├── controllers/      # Request handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── courtController.js
│   │   ├── customerBookingController.js
│   │   ├── notificationController.js
│   │   ├── paymentController.js
│   │   ├── publicController.js
│   │   ├── reviewController.js
│   │   ├── timeSlotController.js
│   │   └── venueController.js
│   ├── generated/        # Auto-generated Prisma client
│   │   └── prisma/
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   └── validation.js # Request validation
│   ├── models/          # Legacy Mongoose models (deprecated)
│   ├── routes/          # API route definitions
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── notifications.js
│   │   ├── payments.js
│   │   ├── public.js
│   │   ├── reviews.js
│   │   └── venueManagement.js
│   ├── services/        # Business logic services
│   │   ├── emailService.js
│   │   └── tempUserStorage.js
│   └── utils/           # Utility functions
│       ├── databaseTables.js
│       ├── jwt.js
│       └── migrateToPrisma.js
├── prisma/
│   └── schema.prisma    # Database schema definition
├── scripts/
│   └── init-db.js      # Database initialization script
├── .env                # Environment variables
├── index.js           # Main application entry point
└── package.json       # Backend dependencies and scripts
```

## 🎨 Frontend Structure (`/frontend`)

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Shared components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Shadcn/ui components
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   │   ├── api.ts      # Axios API client
│   │   ├── types.ts    # TypeScript types
│   │   └── utils.ts    # Utility functions
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── auth/       # Authentication pages
│   │   ├── booking/    # Booking pages
│   │   ├── owner/      # Venue owner pages
│   │   └── user/       # User pages
│   ├── services/       # API service functions
│   │   ├── adminService.ts
│   │   ├── authService.ts
│   │   ├── bookingService.ts
│   │   ├── notificationService.ts
│   │   ├── paymentService.ts
│   │   ├── reviewService.ts
│   │   └── venueService.ts
│   ├── utils/          # Frontend utilities
│   └── App.tsx         # Main application component
├── public/             # Static assets
├── index.html         # HTML template
├── package.json       # Frontend dependencies
└── vite.config.ts     # Vite configuration
```

## 🗄️ Database Schema (Prisma)

### Core Tables

- **users** - User accounts and authentication
- **venues** - Sports facilities
- **courts** - Individual courts within venues
- **bookings** - Reservation records
- **reviews** - User feedback and ratings
- **time_slots** - Available booking times
- **notifications** - System notifications
- **notification_preferences** - User notification settings

### Supporting Tables

- **payment_intents** - Payment processing records
- **refunds** - Refund transactions
- **review_helpful** - Review helpfulness votes

## 🔧 Configuration Files

### Backend Configuration

- **`.env`** - Environment variables (database, email, JWT)
- **`prisma/schema.prisma`** - Database schema
- **`package.json`** - Dependencies and scripts
- **`.prettierrc.json`** - Code formatting rules
- **`eslint.config.js`** - Linting configuration

### Frontend Configuration

- **`vite.config.ts`** - Vite build tool configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`package.json`** - Dependencies and scripts

## 🚀 Key Features by Directory

### `/backend/src/controllers`

- **authController.js** - Registration, login, OTP verification
- **venueController.js** - Venue CRUD operations
- **bookingController.js** - Booking management
- **adminController.js** - Admin operations (approval, moderation)

### `/frontend/src/pages`

- **auth/** - Login, signup, password reset
- **admin/** - Admin dashboard, facility approval
- **owner/** - Venue management, booking overview
- **user/** - Profile, booking history

### `/backend/src/routes`

- **auth.js** - Authentication endpoints
- **public.js** - Public API (venues, search)
- **venueManagement.js** - Venue owner operations
- **admin.js** - Administrative functions

## 🔒 Security Features

- JWT token authentication
- Password hashing (bcrypt)
- Request validation
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention (Prisma)

## 🎯 API Endpoints Structure

### Public Endpoints (`/api/public`)

- Venue browsing and search
- Venue details and availability
- Public reviews and ratings

### Authenticated Endpoints

- **`/api/auth`** - User authentication
- **`/api/bookings`** - Booking management
- **`/api/venue-management`** - Venue owner operations
- **`/api/admin`** - Administrative functions
- **`/api/notifications`** - User notifications
- **`/api/reviews`** - Review management
- **`/api/payments`** - Payment processing

## 📱 Frontend Routing Structure

### Public Routes

- `/` - Homepage
- `/venues` - Venue listing
- `/venue/:id` - Venue details
- `/login`, `/signup` - Authentication

### Protected Routes

- `/profile` - User profile
- `/bookings` - User booking history
- `/owner/*` - Venue owner dashboard
- `/admin/*` - Admin panel

## 🔄 Development Workflow

1. **Backend Changes**: Modify controllers, routes, or schema
2. **Database Updates**: Update Prisma schema and push changes
3. **Frontend Changes**: Update components, pages, or services
4. **API Integration**: Ensure frontend services match backend endpoints
5. **Testing**: Test full user workflows
6. **Documentation**: Update README and code comments

This structure ensures clean separation of concerns, scalability, and maintainability for the QuickCourt platform.
