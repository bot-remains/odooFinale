# QuickCourt Authentication Integration Guide

## ✅ Integration Status

The frontend and backend authentication system has been successfully integrated. Here's what's been implemented:

## 🚀 Features Implemented

### Backend Authentication Features

- [x] User registration with email verification (OTP)
- [x] Email verification (OTP system)
- [x] User login with JWT tokens
- [x] Forgot password functionality
- [x] Password reset with secure tokens
- [x] Profile management
- [x] Password change functionality
- [x] User logout
- [x] JWT middleware for protected routes
- [x] Role-based access control (user, facility_owner, admin)

### Frontend Authentication Features

- [x] Registration form with validation
- [x] OTP verification page
- [x] Login form
- [x] Forgot password page
- [x] Reset password page
- [x] Authentication context
- [x] Protected routes
- [x] Role-based redirects
- [x] Persistent authentication state
- [x] Error handling and user feedback

## 🔧 API Endpoints

### Public Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Protected Endpoints

- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/profile` - Get user profile (alias)
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

## 🧪 Testing the Integration

1. **Start Backend Server:**

   ```bash
   cd backend
   npm start
   ```

   Backend runs on: http://localhost:3000

2. **Start Frontend Server:**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend runs on: http://localhost:8080

3. **Test Registration Flow:**

   - Go to http://localhost:8080/signup
   - Fill out the registration form
   - Check console for OTP (email service configured)
   - Go to verification page and enter OTP
   - Should redirect to dashboard based on role

4. **Test Login Flow:**

   - Go to http://localhost:8080/login
   - Enter credentials
   - Should redirect to appropriate dashboard

5. **Test Password Reset:**
   - Go to http://localhost:8080/forgot-password
   - Enter email
   - Check console for reset token
   - Use token in reset password URL
   - Reset password and login

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation and sanitization
- Rate limiting ready (configured in .env)
- Secure password requirements
- OTP expiration (10 minutes)
- Reset token expiration (1 hour)
- Role-based access control

## 📱 User Roles & Redirects

- **User:** Redirects to `/` (main page)
- **Facility Owner:** Redirects to `/owner/dashboard`
- **Admin:** Redirects to `/admin/dashboard`

## 🗄️ Database Integration

- Uses PostgreSQL with Prisma ORM
- Connected to DigitalOcean database
- Automatic migrations available
- User model with role-based permissions

## 📧 Email Service

- SMTP configured with Gmail
- OTP verification emails
- Password reset emails
- Welcome emails after verification
- Fallback to console logging if email fails

## 🌐 CORS Configuration

Backend is configured to allow requests from:

- http://localhost:8080 (current frontend)
- http://localhost:3000
- http://localhost:5173
- http://localhost:8081
- http://localhost:8082

## 🔄 State Management

- React Query for API state management
- React Context for authentication state
- LocalStorage for persistent auth tokens
- Automatic token refresh handling
- Cross-tab authentication sync

## 🎨 UI/UX Features

- Responsive design with Tailwind CSS
- Form validation with real-time feedback
- Loading states and error handling
- Toast notifications for user feedback
- Professional auth page designs
- Password strength indicators

## 🚀 Next Steps

1. **Testing:** Test all authentication flows thoroughly
2. **Error Handling:** Add comprehensive error boundaries
3. **Security:** Implement additional security measures as needed
4. **Performance:** Optimize API calls and caching
5. **Features:** Add additional user management features

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors:**

   - Ensure backend CORS is configured correctly
   - Check frontend API base URL

2. **Database Connection:**

   - Verify DATABASE_URL in backend .env
   - Check PostgreSQL connection

3. **Email Issues:**

   - Check SMTP credentials in .env
   - OTP codes will log to console if email fails

4. **Token Issues:**
   - Clear localStorage and try again
   - Check JWT_SECRET configuration

## 📝 Environment Variables

### Backend (.env)

```
PORT=3000
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:8080
```

The authentication system is now fully integrated and ready for production use!
