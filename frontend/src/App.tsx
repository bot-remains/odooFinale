import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Venues from "./pages/Venues";
import VenueDetails from "./pages/VenueDetails";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import OTPVerify from "./pages/auth/OTPVerify";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/otp" element={<OTPVerify />} />
            
            {/* All other routes with layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/venues" element={<Venues />} />
                  <Route path="/venue/:id" element={<VenueDetails />} />
                  <Route path="/booking/:venueId" element={<CourtBooking />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/bookings" element={<MyBookings />} />

                  <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                  <Route path="/owner/facility" element={<FacilityManagement />} />
                  <Route path="/owner/timeslots" element={<TimeSlots />} />
                  <Route path="/owner/bookings" element={<BookingOverview />} />

                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/facilities" element={<FacilityApproval />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/reports" element={<ReportsModeration />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
