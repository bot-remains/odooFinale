import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Bar, BarChart, Pie, PieChart, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Building, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const bookingData = [
  { name: "Jan", bookings: 120, revenue: 58000, users: 45 },
  { name: "Feb", bookings: 150, revenue: 72000, users: 62 },
  { name: "Mar", bookings: 180, revenue: 89000, users: 70 },
  { name: "Apr", bookings: 210, revenue: 105000, users: 85 },
  { name: "May", bookings: 240, revenue: 125000, users: 98 },
  { name: "Jun", bookings: 280, revenue: 142000, users: 112 },
  { name: "Jul", bookings: 320, revenue: 165000, users: 128 },
  { name: "Aug", bookings: 295, revenue: 152000, users: 135 },
];

const sportData = [
  { name: "Badminton", bookings: 450, color: "#8884d8" },
  { name: "Tennis", bookings: 320, color: "#82ca9d" },
  { name: "Football", bookings: 280, color: "#ffc658" },
  { name: "Cricket", bookings: 220, color: "#ff7300" },
  { name: "Hockey", bookings: 150, color: "#00ff00" },
  { name: "Others", bookings: 100, color: "#ff0000" },
];

const recentActivities = [
  { id: 1, type: "user_joined", user: "John Doe", time: "2 hours ago", icon: "👤" },
  { id: 2, type: "venue_approved", venue: "Elite Sports Hub", time: "4 hours ago", icon: "✅" },
  { id: 3, type: "report_submitted", issue: "Safety concern at City Arena", time: "6 hours ago", icon: "🚨" },
  { id: 4, type: "booking_cancelled", venue: "Tennis Pro Center", time: "8 hours ago", icon: "❌" },
  { id: 5, type: "new_venue", venue: "Champions Hockey Arena", time: "1 day ago", icon: "🏟️" },
];

const AdminDashboard = () => {
  const stats = {
    totalUsers: 3420,
    userGrowth: 12.5,
    totalOwners: 120,
    ownerGrowth: 8.3,
    totalBookings: 18540,
    bookingGrowth: 15.2,
    totalVenues: 430,
    venueGrowth: 6.8,
    pendingApprovals: 8,
    activeReports: 5,
    monthlyRevenue: 152000,
    revenueGrowth: 22.1
  };

  return (
    <div className="container py-10">
      <SEO title="Admin Dashboard – QuickCourt" description="Platform-wide KPIs and trends." />
      <PageHeader title="Admin Dashboard" />
      
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.userGrowth}%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Facility Owners</p>
                <p className="text-2xl font-bold">{stats.totalOwners}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.ownerGrowth}%</span>
                </div>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.bookingGrowth}%</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.revenueGrowth}%</span>
                </div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/admin/facilities">Review Facilities</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Reports</p>
                <p className="text-3xl font-bold text-red-600">{stats.activeReports}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/admin/reports">Handle Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Venues</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalVenues}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Booking & Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Booking & Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ 
              bookings: { label: "Bookings", color: "hsl(var(--primary))" }, 
              revenue: { label: "Revenue (₹)", color: "hsl(var(--accent))" } 
            }}>
              <LineChart data={bookingData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sport Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Sport Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ bookings: { label: "Bookings" } }}>
              <BarChart data={sportData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="bookings" fill="#8884d8" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm">
                      {activity.type === 'user_joined' && `New user ${activity.user} joined the platform`}
                      {activity.type === 'venue_approved' && `Venue "${activity.venue}" was approved`}
                      {activity.type === 'report_submitted' && `New report: ${activity.issue}`}
                      {activity.type === 'booking_cancelled' && `Booking cancelled at ${activity.venue}`}
                      {activity.type === 'new_venue' && `New venue "${activity.venue}" submitted for approval`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-blue-600">Total Users</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalOwners}</div>
                <div className="text-sm text-purple-600">Facility Owners</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalVenues}</div>
                <div className="text-sm text-green-600">Active Venues</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.totalBookings}</div>
                <div className="text-sm text-orange-600">Total Bookings</div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">This Month's Highlights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>New Users:</span>
                  <span className="font-medium text-green-600">+{Math.floor(stats.totalUsers * 0.08)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Venues:</span>
                  <span className="font-medium text-blue-600">+{Math.floor(stats.totalVenues * 0.05)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium text-purple-600">₹{stats.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reports Resolved:</span>
                  <span className="font-medium text-orange-600">12</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
