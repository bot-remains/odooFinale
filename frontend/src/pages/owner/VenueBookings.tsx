import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  IndianRupee,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { useVenueDetails } from "@/services/venueService";
import { format } from 'date-fns';

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  courtName: string;
  sportType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingDate: string;
}

// Mock data - replace with actual API call
const mockBookings: Booking[] = [
  {
    id: 1,
    customerName: "John Doe",
    customerPhone: "9876543210",
    courtName: "Badminton Court 1",
    sportType: "Badminton",
    date: "2025-01-15",
    startTime: "10:00",
    endTime: "11:00",
    duration: 1,
    totalAmount: 500,
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: "2025-01-10"
  },
  {
    id: 2,
    customerName: "Jane Smith",
    customerPhone: "9876543211",
    courtName: "Tennis Court A",
    sportType: "Tennis",
    date: "2025-01-16",
    startTime: "14:00",
    endTime: "16:00",
    duration: 2,
    totalAmount: 1600,
    status: "pending",
    paymentStatus: "pending",
    bookingDate: "2025-01-11"
  },
  {
    id: 3,
    customerName: "Mike Johnson",
    customerPhone: "9876543212",
    courtName: "Football Ground",
    sportType: "Football",
    date: "2025-01-17",
    startTime: "16:00",
    endTime: "18:00",
    duration: 2,
    totalAmount: 2400,
    status: "completed",
    paymentStatus: "paid",
    bookingDate: "2025-01-12"
  }
];

const VenueBookings = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { data: venue, isLoading: venueLoading, error: venueError } = useVenueDetails(Number(venueId));
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Mock loading state - replace with actual loading state
  const isLoading = venueLoading;
  const bookings = mockBookings;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800", 
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      refunded: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    
    if (dateFilter !== 'all') {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          return bookingDate.toDateString() === today.toDateString();
        case 'upcoming':
          return bookingDate > today;
        case 'past':
          return bookingDate < today;
        default:
          return true;
      }
    }
    
    return true;
  });

  const totalRevenue = filteredBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalBookings = filteredBookings.length;
  const pendingBookings = filteredBookings.filter(b => b.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="container py-10">
        <SEO title="Venue Bookings – QuickCourt" description="Manage venue bookings and revenue." />
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate(`/owner/venues/${venueId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venue
          </Button>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="container py-10">
        <SEO title="Venue Bookings – QuickCourt" description="Manage venue bookings and revenue." />
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/owner/venues')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venues
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load venue details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-7xl">
      <SEO title={`${venue.name} Bookings – QuickCourt`} description={`Manage bookings for ${venue.name}.`} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(`/owner/venues/${venueId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venue
          </Button>
          <div>
            <PageHeader title={`${venue.name} Bookings`} />
            <p className="text-gray-600 mt-1">Manage bookings and track revenue</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <div className="flex space-x-4">
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-medium">{booking.customerName}</h4>
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {booking.customerPhone}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(booking.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="w-3 h-3 mr-1" />
                          ₹{booking.totalAmount}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-sm text-gray-900 font-medium">{booking.courtName}</span>
                        <span className="text-sm text-gray-600 ml-2">({booking.sportType})</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline">
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline">
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No bookings found for the selected filters.</p>
              <p className="text-sm mt-1">Bookings will appear here once customers start booking your courts.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VenueBookings;
