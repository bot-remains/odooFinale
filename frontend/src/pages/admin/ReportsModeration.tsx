import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Flag,
  MessageCircle,
  Calendar,
  MapPin,
  Database,
} from "lucide-react";

const ReportsModeration = () => {
  return (
    <div className="container py-10">
      <SEO
        title="Reports & Moderation – QuickCourt"
        description="Manage user reports and moderate content."
      />
      <PageHeader title="Reports & Moderation" />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Content Moderation</h2>
            <p className="text-gray-600">Review and handle user reports</p>
          </div>
        </div>
      </div>

      {/* Coming Soon / Feature Implementation Notice */}
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-4">
            Feature Under Development
          </h3>
          <div className="space-y-3 text-sm max-w-md mx-auto">
            <p>
              The Reports & Moderation system is currently being implemented.
            </p>
            <p>This feature will include:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Flag className="w-5 h-5 text-orange-500" />
                <span className="text-left">User Reports Management</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-left">Content Moderation</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="text-left">Review Management</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="text-left">Incident Tracking</span>
              </div>
            </div>
            <div className="mt-6">
              <Badge variant="outline" className="px-4 py-2">
                Coming Soon
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Optional: Statistics Cards for Future Implementation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Flag className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">-</div>
            <div className="text-sm text-gray-600">Pending Reports</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">-</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">-</div>
            <div className="text-sm text-gray-600">Resolved Today</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">-</div>
            <div className="text-sm text-gray-600">Total This Month</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsModeration;
