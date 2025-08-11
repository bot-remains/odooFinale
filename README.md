# QuickCourt - Sports Booking Platform

A comprehensive full-stack web application for booking local sports facilities and creating matches. Built with React.js frontend and Node.js backend with PostgreSQL database.

## 🏗️ Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS + Shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

### Backend

- **Framework**: Express.js with ES6 modules
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Email**: Nodemailer (Gmail SMTP)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Database

- **Type**: PostgreSQL (Production: DigitalOcean)
- **ORM**: Prisma
- **Schema**: Users, Venues, Courts, Bookings, Reviews, Notifications

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd odooFinale
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Setup environment variables
   cp .env.example .env
   # Edit .env with your database credentials

   # Generate Prisma client and push schema
   npm run prisma:generate
   npm run prisma:push

   # Initialize database with sample data
   npm run init-db
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Development Servers**

   Backend (Terminal 1):

   ```bash
   cd backend
   npm run dev
   ```

   Frontend (Terminal 2):

   ```bash
   cd frontend
   npm run dev
   ```

### Default URLs

- Frontend: http://localhost:8081
- Backend API: http://localhost:3000
- Backend Health Check: http://localhost:3000/health

## 👥 Default Accounts

The system comes with pre-configured accounts for testing:

### Admin Account

- **Email**: admin@quickcourt.com
- **Password**: admin123
- **Role**: Administrator
- **Access**: Full system administration, facility approval

### Venue Owner Account

- **Email**: owner@quickcourt.com
- **Password**: owner123
- **Role**: Venue Owner
- **Access**: Manage venues, courts, bookings

### Regular User Account

- **Email**: user@quickcourt.com
- **Password**: user123
- **Role**: Customer
- **Access**: Browse venues, make bookings, write reviews

## 🏟️ Features

### For Customers

- **Browse Venues**: Search and filter sports facilities
- **View Details**: Facility information, photos, amenities
- **Book Courts**: Real-time availability and booking
- **Manage Bookings**: View, reschedule, cancel bookings
- **Reviews & Ratings**: Rate and review facilities
- **Profile Management**: Update personal information
- **Notifications**: Booking confirmations and reminders

### For Venue Owners

- **Facility Management**: Add/edit venue information
- **Court Management**: Configure courts and pricing
- **Time Slot Management**: Set availability schedules
- **Booking Overview**: Monitor all bookings
- **Analytics Dashboard**: Revenue and booking insights

### For Administrators

- **Facility Approval**: Review and approve new venues
- **User Management**: Manage user accounts and roles
- **Reports & Moderation**: Monitor platform activity
- **System Settings**: Configure platform parameters

## 📱 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/profile` - Get user profile

### Venues

- `GET /api/public/venues` - List all venues
- `GET /api/public/venues/:id` - Get venue details
- `POST /api/venue-management/venues` - Create venue (Owner)
- `PUT /api/venue-management/venues/:id` - Update venue

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - User's bookings
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Admin

- `GET /api/admin/venues/pending` - Pending venues
- `PUT /api/admin/venues/:id/approve` - Approve venue
- `PUT /api/admin/venues/:id/reject` - Reject venue

## 🗄️ Database Schema

### Core Entities

- **Users**: Authentication, profiles, roles
- **Venues**: Sports facilities information
- **Courts**: Individual courts within venues
- **Bookings**: Reservation records
- **Reviews**: User feedback and ratings
- **TimeSlots**: Available booking times
- **Notifications**: System notifications

### Key Relationships

- Users can own multiple Venues
- Venues contain multiple Courts
- Users make Bookings for Courts
- Bookings can have Reviews
- All entities have audit trails

## 🔧 Configuration

### Environment Variables (Backend)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend
FRONTEND_URL=http://localhost:8081
```

### Frontend Configuration

The frontend automatically connects to the backend API at `http://localhost:3000`. Update `src/lib/api.ts` if needed.

## 🛠️ Development Scripts

### Backend

```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run init-db      # Initialize database with sample data
npm run prisma:generate  # Generate Prisma client
npm run prisma:push     # Push schema to database
npm run prisma:studio   # Open Prisma Studio
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🧪 Testing

### Backend Testing

```bash
# Test database connection
npm run test:db

# Test email service
npm run test:email-otp

# Health check
curl http://localhost:3000/health
```

### Frontend Testing

- Open browser to http://localhost:8081
- Test user registration and login
- Browse venues and make test bookings
- Test admin approval workflow

## 🚦 Production Deployment

### Backend

1. Set production environment variables
2. Build and deploy to your server
3. Ensure PostgreSQL is accessible
4. Run database migrations

### Frontend

1. Update API base URL for production
2. Build production bundle: `npm run build`
3. Deploy to static hosting (Vercel, Netlify, etc.)

### Database

- Use managed PostgreSQL (DigitalOcean, AWS RDS, etc.)
- Ensure SSL is enabled
- Run `npm run prisma:push` in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

## 🎯 Future Enhancements

- [ ] Mobile app development
- [ ] Payment gateway integration
- [ ] Real-time chat system
- [ ] Advanced booking analytics
- [ ] Multi-language support
- [ ] Social features and community
- [ ] Equipment rental system
- [ ] Tournament management

---

**QuickCourt** - Making sports facility booking simple and efficient! 🏆
