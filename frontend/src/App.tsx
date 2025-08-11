import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Venues from "./pages/Venues";
import VenueDetails from "./pages/VenueDetails";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import OTPVerify from "./pages/auth/OTPVerify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UserProfile from "./pages/user/Profile";
import MyBookings from "./pages/user/MyBookings";
import CourtBooking from "./pages/booking/CourtBooking";
import OwnerDashboard from "./pages/owner/Dashboard";
import FacilityManagement from "./pages/owner/FacilityManagement";
import TimeSlots from "./pages/owner/TimeSlots";
import BookingOverview from "./pages/owner/BookingOverview";
import AdminDashboard from "./pages/admin/Dashboard";
import FacilityApproval from "./pages/admin/FacilityApproval";
import UserManagement from "./pages/admin/UserManagement";
import ReportsModeration from "./pages/admin/ReportsModeration";
import AdminProfile from "./pages/admin/Profile";
import FacilityProvider from "./pages/FacilityProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RedirectRoute from "./components/auth/RedirectRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401 errors
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response: { status: number } };
          if (axiosError.response?.status === 401) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes without layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/otp" element={<OTPVerify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* All other routes with layout */}
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/venues" element={<Venues />} />
                      <Route path="/venue/:id" element={<VenueDetails />} />
                      <Route
                        path="/booking/:venueId"
                        element={<CourtBooking />}
                      />

                      {/* Redirect old route to new admin route */}
                      <Route
                        path="/facility-provider"
                        element={
                          <RedirectRoute
                            from="/facility-provider"
                            to="/admin/facility-provider"
                          />
                        }
                      />

                      {/* Protected user routes */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <UserProfile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/bookings"
                        element={
                          <ProtectedRoute>
                            <MyBookings />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected owner routes */}
                      <Route
                        path="/owner/dashboard"
                        element={
                          <ProtectedRoute>
                            <OwnerDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/owner/facility"
                        element={
                          <ProtectedRoute>
                            <FacilityManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/owner/timeslots"
                        element={
                          <ProtectedRoute>
                            <TimeSlots />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/owner/bookings"
                        element={
                          <ProtectedRoute>
                            <BookingOverview />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected admin routes */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/facilities"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <FacilityApproval />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <UserManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/reports"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <ReportsModeration />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/profile"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminProfile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/facility-provider"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <FacilityProvider />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
