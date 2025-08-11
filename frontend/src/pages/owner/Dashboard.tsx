import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useVenueManagementDashboard,
  useMyVenues,
} from "@/services/venueService";
import { TrendingUp, Building, Calendar, DollarSign } from "lucide-react";

const OwnerDashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading } =
    useVenueManagementDashboard();
  const { data: venuesData, isLoading: venuesLoading } = useMyVenues();

  // Type-safe access to dashboard data
  const dashboard =
    (dashboardData as {
      totalBookings?: number;
      monthlyRevenue?: number;
      averageRating?: number;
      occupancyRate?: number;
      weeklyBookings?: number[];
    }) || {};

  // Sample data for chart (fallback values if API doesn't provide weekly data)
  const weeklyData = [
    { name: "Mon", bookings: dashboard.weeklyBookings?.[0] || 12 },
    { name: "Tue", bookings: dashboard.weeklyBookings?.[1] || 18 },
    { name: "Wed", bookings: dashboard.weeklyBookings?.[2] || 9 },
    { name: "Thu", bookings: dashboard.weeklyBookings?.[3] || 22 },
    { name: "Fri", bookings: dashboard.weeklyBookings?.[4] || 28 },
    { name: "Sat", bookings: dashboard.weeklyBookings?.[5] || 35 },
    { name: "Sun", bookings: dashboard.weeklyBookings?.[6] || 20 },
  ];

  return (
    <div className="container py-10">
      <SEO
        title="Owner Dashboard – QuickCourt"
        description="KPIs and charts for your facility performance."
      />
      <PageHeader title="Dashboard" subtitle="Welcome back!" />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Venues
                </p>
                {venuesLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">
                    {venuesData?.length || 0}
                  </p>
                )}
              </div>
              <Building className="w-8 h-8 text-blue-600" />
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
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">
                    {dashboard.totalBookings || 0}
                  </p>
                )}
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
                  Active Courts
                </p>
                {venuesLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">
                    {venuesData?.reduce((total, venue) => {
                      const venueWithCourts = venue as typeof venue & {
                        courts?: Array<unknown>;
                      };
                      return total + (venueWithCourts.courts?.length || 0);
                    }, 0) || 0}
                  </p>
                )}
              </div>
              <div className="text-2xl">🏟️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">
                    ₹{(dashboard.monthlyRevenue || 42500).toLocaleString()}
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Booking Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer
                config={{
                  bookings: { label: "Bookings", color: "hsl(var(--primary))" },
                }}
              >
                <BarChart data={weeklyData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Bar
                    dataKey="bookings"
                    fill="var(--color-bookings)"
                    radius={4}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {dashboardLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>This Week:</span>
                  <span className="font-medium">
                    {weeklyData.reduce((sum, day) => sum + day.bookings, 0)}{" "}
                    bookings
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating:</span>
                  <span className="font-medium">
                    {dashboard.averageRating || "4.5"} ⭐
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy Rate:</span>
                  <span className="font-medium">
                    {dashboard.occupancyRate || "78"}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Target:</span>
                  <span className="font-medium text-green-600">
                    {Math.round(
                      ((dashboard.monthlyRevenue || 42500) / 50000) * 100
                    )}
                    % achieved
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Venues</CardTitle>
        </CardHeader>
        <CardContent>
          {venuesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : venuesData && venuesData.length > 0 ? (
            <div className="space-y-4">
              {venuesData.map((venue) => (
                <div
                  key={venue.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{venue.name}</h4>
                    <p className="text-sm text-gray-600">{venue.address}</p>
                    <p className="text-sm text-gray-500">
                      {(venue as typeof venue & { courts?: Array<unknown> })
                        .courts?.length || 0}{" "}
                      courts •{" "}
                      {(venue as typeof venue & { rating?: number }).rating ||
                        "No rating"}{" "}
                      ⭐
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        venue.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {venue.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No venues found. Create your first venue to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
