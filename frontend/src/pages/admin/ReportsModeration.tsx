import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Flag,
  MessageCircle,
  Calendar,
  MapPin,
  Database,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSystemReports } from "@/services/adminService";

interface ReportSummary {
  total_venues?: number;
  approved_venues?: number;
  pending_venues?: number;
  total_users?: number;
  active_users?: number;
  facility_owners?: number;
  total_bookings?: number;
  confirmed_bookings?: number;
  total_revenue?: number;
}

interface ReportData {
  summary?: ReportSummary;
  [key: string]: unknown;
}

const ReportsModeration = () => {
  const [reportType, setReportType] = useState<"venues" | "users" | "bookings">(
    "venues"
  );
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { toast } = useToast();

  // API hook
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useSystemReports(reportType, startDate, endDate);

  const handleDownloadReport = () => {
    if (!reportsData) return;

    // Create downloadable JSON report
    const reportContent = JSON.stringify(reportsData, null, 2);
    const blob = new Blob([reportContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report_${startDate}_to_${endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: `${reportType} report has been downloaded successfully.`,
    });
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "venues":
        return <MapPin className="w-4 h-4" />;
      case "users":
        return <MessageCircle className="w-4 h-4" />;
      case "bookings":
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderReportData = () => {
    if (!reportsData || !reportsData.data) {
      return (
        <div className="text-center text-gray-500 p-8">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No report data available for the selected criteria.</p>
        </div>
      );
    }

    const data = reportsData.data as ReportData;

    if (reportType === "venues") {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">Venue Reports Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Total Venues</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.summary?.total_venues || 0}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Approved Venues</div>
              <div className="text-2xl font-bold text-green-600">
                {data.summary?.approved_venues || 0}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Pending Approval</div>
              <div className="text-2xl font-bold text-orange-600">
                {data.summary?.pending_venues || 0}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (reportType === "users") {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">User Reports Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Total Users</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.summary?.total_users || 0}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Active Users</div>
              <div className="text-2xl font-bold text-green-600">
                {data.summary?.active_users || 0}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Facility Owners</div>
              <div className="text-2xl font-bold text-purple-600">
                {data.summary?.facility_owners || 0}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (reportType === "bookings") {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">Booking Reports Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Total Bookings</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.summary?.total_bookings || 0}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Confirmed</div>
              <div className="text-2xl font-bold text-green-600">
                {data.summary?.confirmed_bookings || 0}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{(data.summary?.total_revenue || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container py-10">
      <SEO
        title="Reports & Analytics – QuickCourt"
        description="System reports and user-submitted reports analytics."
      />
      <PageHeader title="Reports & Analytics" />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">System Reports</h2>
            <p className="text-gray-600">
              Generate and download system analytics reports
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Report Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select
            value={reportType}
            onValueChange={(value: "venues" | "users" | "bookings") =>
              setReportType(value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venues">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Venues Report
                </div>
              </SelectItem>
              <SelectItem value="users">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Users Report
                </div>
              </SelectItem>
              <SelectItem value="bookings">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Bookings Report
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>

          <Button
            onClick={handleDownloadReport}
            variant="outline"
            disabled={!reportsData || isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getReportTypeIcon(reportType)}
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            <Badge variant="outline">
              {startDate} to {endDate}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>Error loading report data. Please try again.</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            renderReportData()
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Flag className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">
              {reportType === "venues"
                ? (reportsData?.data as ReportData)?.summary?.pending_venues ||
                  0
                : "-"}
            </div>
            <div className="text-sm text-gray-600">Pending Reviews</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-600">User Reports</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {reportType === "users"
                ? (reportsData?.data as ReportData)?.summary?.total_users || 0
                : "-"}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {reportType === "bookings"
                ? (reportsData?.data as ReportData)?.summary?.total_bookings ||
                  0
                : "-"}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsModeration;
