import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminDashboard } from "@/services/adminService";
import { AdminDashboardStats, TrendData, RecentActivity } from "@/lib/types";

// Extended interface for stats with additional properties
interface ExtendedAdminStats extends AdminDashboardStats {
  trends?: TrendData[];
  recentActivities?: RecentActivity[];
}
import { useToast } from "@/hooks/use-toast";

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
  {
    id: 1,
    type: "user_joined",
    user: "John Doe",
    time: "2 hours ago",
    icon: "👤",
  },
  {
    id: 2,
    type: "venue_approved",
    venue: "Elite Sports Hub",
    time: "4 hours ago",
    icon: "✅",
  },
  {
    id: 3,
    type: "report_submitted",
    issue: "Safety concern at City Arena",
    time: "6 hours ago",
    icon: "🚨",
  },
  {
    id: 4,
    type: "booking_cancelled",
    venue: "Tennis Pro Center",
    time: "8 hours ago",
    icon: "❌",
  },
  {
    id: 5,
    type: "new_venue",
    venue: "Champions Hockey Arena",
    time: "1 day ago",
    icon: "🏟️",
  },
];

const AdminDashboard = () => {
  const { toast } = useToast();
  const { data: dashboardData, isLoading, error } = useAdminDashboard();

  // Handle error once when error state changes
  if (error && !isLoading) {
    console.error("Dashboard error:", error);
    toast({
      title: "Error loading dashboard",
      description: "Failed to load admin dashboard data. Using default values.",
      variant: "destructive",
    });
  }

  // Provide safe defaults with explicit fallbacks
  const stats = {
    totalUsers: dashboardData?.totalUsers ?? 0,
    totalVenues: dashboardData?.totalVenues ?? 0,
    totalBookings: dashboardData?.totalBookings ?? 0,
    totalRevenue: dashboardData?.totalRevenue ?? 0,
    pendingVenues: dashboardData?.pendingVenues ?? 0,
    activeUsers: dashboardData?.activeUsers ?? 0,
    recentBookings: dashboardData?.recentBookings ?? [],
    topVenues: dashboardData?.topVenues ?? [],
  };

  // Transform API trends data for charts
  const bookingData =
    (dashboardData as ExtendedAdminStats)?.trends?.map((trend: TrendData) => {
      const date = new Date(trend.month);
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return {
        name: monthNames[date.getMonth()],
        bookings: trend.bookings || 0,
        revenue: (trend.revenue || 0) / 100, // Convert from paise to rupees
      };
    }) || [];

  // Transform sport data from venue data (this would need a separate API endpoint for sport-specific data)
  const sportData = [
    {
      name: "Badminton",
      bookings: Math.floor((stats?.totalBookings || 0) * 0.35),
    },
    {
      name: "Tennis",
      bookings: Math.floor((stats?.totalBookings || 0) * 0.25),
    },
    {
      name: "Football",
      bookings: Math.floor((stats?.totalBookings || 0) * 0.22),
    },
    {
      name: "Cricket",
      bookings: Math.floor((stats?.totalBookings || 0) * 0.18),
    },
  ];

  return (
    <div className="container py-10">
      <SEO
        title="Admin Dashboard – QuickCourt"
        description="Platform-wide KPIs and trends."
      />
      <PageHeader title="Admin Dashboard" />

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">
                    {(stats.totalUsers || 0).toLocaleString()}
                  </p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    Active: {stats.activeUsers || 0}
                  </span>
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
                <p className="text-sm font-medium text-gray-600">
                  Total Venues
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stats.totalVenues || 0}</p>
                )}
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">
                    Pending: {stats.pendingVenues || 0}
                  </span>
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
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">
                    {(stats.totalBookings || 0).toLocaleString()}
                  </p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">This month</span>
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
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">
                    ₹{(stats.totalRevenue || 0).toLocaleString()}
                  </p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">Platform total</span>
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
                <p className="text-sm font-medium text-gray-600">
                  Pending Approvals
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.pendingVenues || 0}
                  </p>
                )}
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
                <p className="text-sm font-medium text-gray-600">
                  Recent Bookings
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-blue-600">
                    {(stats.recentBookings || []).length}
                  </p>
                )}
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/admin/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Venues
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalVenues || 0}
                  </p>
                )}
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
            <ChartContainer
              config={{
                bookings: { label: "Bookings", color: "hsl(var(--primary))" },
                revenue: { label: "Revenue (₹)", color: "hsl(var(--accent))" },
              }}
            >
              <LineChart data={bookingData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-bookings)"
                  strokeWidth={2}
                />
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
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : ((dashboardData as ExtendedAdminStats)?.recentActivities || [])
                .length > 0 ? (
              <div className="space-y-4">
                {((dashboardData as ExtendedAdminStats)?.recentActivities || [])
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div
                      key={`${activity.entity_type}-${activity.entity_id}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <span className="text-xl">
                        {activity.type === "booking_created"
                          ? "📅"
                          : activity.type === "venue_created"
                          ? "🏟️"
                          : activity.type === "review_created"
                          ? "⭐"
                          : "📄"}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm">{activity.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()} -
                          by {activity.user_name}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activities to display
              </div>
            )}
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
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalUsers}
                  </div>
                )}
                <div className="text-sm text-blue-600">Total Users</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.activeUsers}
                  </div>
                )}
                <div className="text-sm text-purple-600">Active Users</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalVenues}
                  </div>
                )}
                <div className="text-sm text-green-600">Total Venues</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalBookings}
                  </div>
                )}
                <div className="text-sm text-orange-600">Total Bookings</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Recent Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pending Venues:</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-8" />
                  ) : (
                    <span className="font-medium text-orange-600">
                      {stats.pendingVenues}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Recent Activities:</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-8" />
                  ) : (
                    <span className="font-medium text-blue-600">
                      {
                        (
                          (dashboardData as ExtendedAdminStats)
                            ?.recentActivities || []
                        ).length
                      }
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    <span className="font-medium text-purple-600">
                      ₹{((stats.totalRevenue || 0) / 100).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Top Venues:</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-8" />
                  ) : (
                    <span className="font-medium text-green-600">
                      {(stats.topVenues || []).length}
                    </span>
                  )}
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
