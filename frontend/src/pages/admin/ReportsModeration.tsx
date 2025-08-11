import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, CheckCircle, X, AlertTriangle, Flag, MessageCircle, Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock reports data
const mockReports = [
  {
    id: 1,
    type: "venue",
    category: "Poor Maintenance",
    priority: "high",
    status: "pending",
    reportedBy: {
      name: "John Doe",
      email: "john.doe@email.com",
      avatar: "JD"
    },
    reportedItem: {
      type: "venue",
      name: "City Sports Arena",
      id: 15,
      owner: "Mike Wilson",
      location: "Delhi, DL"
    },
    description: "The badminton courts are in very poor condition. The flooring is damaged and nets are torn. Multiple safety hazards present.",
    evidence: ["court_damage1.jpg", "torn_net.jpg", "floor_issue.jpg"],
    submittedDate: "2024-08-10",
    bookingId: "BK123456"
  },
  {
    id: 2,
    type: "user",
    category: "Inappropriate Behavior",
    priority: "medium",
    status: "under_review",
    reportedBy: {
      name: "Sarah Smith",
      email: "sarah.smith@email.com",
      avatar: "SS"
    },
    reportedItem: {
      type: "user",
      name: "Rude Player",
      id: 42,
      email: "rude.player@email.com"
    },
    description: "This user was extremely rude during our booking session. Used inappropriate language and threatened other players.",
    evidence: [],
    submittedDate: "2024-08-09",
    bookingId: "BK123457"
  },
  {
    id: 3,
    type: "venue",
    category: "Fraud/Scam",
    priority: "critical",
    status: "pending",
    reportedBy: {
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      avatar: "AJ"
    },
    reportedItem: {
      type: "venue",
      name: "Fake Tennis Club",
      id: 28,
      owner: "Suspicious Owner",
      location: "Mumbai, MH"
    },
    description: "This venue took payment but the facility doesn't exist at the given address. Clear case of fraud.",
    evidence: ["payment_proof.jpg", "location_photo.jpg"],
    submittedDate: "2024-08-08",
    bookingId: "BK123458"
  },
  {
    id: 4,
    type: "owner",
    category: "Overcharging",
    priority: "medium",
    status: "resolved",
    reportedBy: {
      name: "David Brown",
      email: "david.brown@email.com",
      avatar: "DB"
    },
    reportedItem: {
      type: "owner",
      name: "Greedy Owner",
      id: 15,
      email: "greedy.owner@email.com",
      venues: ["Premium Sports Complex"]
    },
    description: "Owner charged extra fees that weren't mentioned during booking. Hidden charges for basic amenities.",
    evidence: ["receipt.jpg", "booking_screenshot.jpg"],
    submittedDate: "2024-08-07",
    bookingId: "BK123459",
    resolution: "Owner was warned and extra charges were refunded to the user."
  },
  {
    id: 5,
    type: "venue",
    category: "Safety Issues",
    priority: "high",
    status: "pending",
    reportedBy: {
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      avatar: "EW"
    },
    reportedItem: {
      type: "venue",
      name: "Unsafe Hockey Ground",
      id: 33,
      owner: "Careless Owner",
      location: "Bangalore, KA"
    },
    description: "The hockey field has multiple potholes and broken glass. Several players have been injured. Immediate action required.",
    evidence: ["injury_photo.jpg", "ground_condition.jpg", "medical_report.pdf"],
    submittedDate: "2024-08-06",
    bookingId: "BK123460"
  }
];

const ReportsModeration = () => {
  const [reports, setReports] = useState(mockReports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [resolutionNote, setResolutionNote] = useState("");
  const { toast } = useToast();

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesPriority = filterPriority === "all" || report.priority === filterPriority;
    const matchesType = filterType === "all" || report.type === filterType;
    
    return matchesStatus && matchesPriority && matchesType;
  });

  const handleResolve = (reportId, resolution) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: "resolved", resolution: resolution }
        : report
    ));
    toast({
      title: "Report resolved ✅",
      description: "The report has been marked as resolved.",
    });
  };

  const handleDismiss = (reportId) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: "dismissed" }
        : report
    ));
    toast({
      title: "Report dismissed",
      description: "The report has been dismissed.",
    });
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending": return "secondary";
      case "under_review": return "default";
      case "resolved": return "default";
      case "dismissed": return "outline";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "fraud/scam": return "🚨";
      case "safety issues": return "⚠️";
      case "poor maintenance": return "🔧";
      case "inappropriate behavior": return "😠";
      case "overcharging": return "💰";
      default: return "📋";
    }
  };

  return (
    <div className="container py-10">
      <SEO title="Reports & Moderation – QuickCourt" description="View reports submitted by users and take actions." />
      <PageHeader title="Reports & Moderation" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">User Reports ({filteredReports.length})</h2>
            <p className="text-gray-600">Review and moderate user-reported issues</p>
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="under_review">👀 Under Review</SelectItem>
              <SelectItem value="resolved">✅ Resolved</SelectItem>
              <SelectItem value="dismissed">❌ Dismissed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">🚨 Critical</SelectItem>
              <SelectItem value="high">🔴 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="venue">🏟️ Venue Reports</SelectItem>
              <SelectItem value="user">👤 User Reports</SelectItem>
              <SelectItem value="owner">🏢 Owner Reports</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{report.category}</h3>
                        <Badge variant={getPriorityBadgeVariant(report.priority)}>
                          {report.priority === 'critical' && '🚨'}
                          {report.priority === 'high' && '🔴'}
                          {report.priority === 'medium' && '🟡'}
                          {report.priority === 'low' && '🟢'}
                          {' '}{report.priority.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {report.status === 'pending' && '⏳'}
                          {report.status === 'under_review' && '👀'}
                          {report.status === 'resolved' && '✅'}
                          {report.status === 'dismissed' && '❌'}
                          {' '}{report.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Reported against: <span className="font-medium">{report.reportedItem.name}</span>
                        {report.reportedItem.location && (
                          <span className="ml-2">📍 {report.reportedItem.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Reported By</h4>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {report.reportedBy.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{report.reportedBy.name}</div>
                          <div className="text-xs text-gray-600">{report.reportedBy.email}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Report Details</h4>
                      <div className="text-sm space-y-1">
                        <div>📅 {new Date(report.submittedDate).toLocaleDateString()}</div>
                        <div>🎫 Booking: {report.bookingId}</div>
                        {report.evidence.length > 0 && (
                          <div>📎 {report.evidence.length} evidence files</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {report.description}
                    </p>
                  </div>

                  {report.status === 'resolved' && report.resolution && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-green-600">Resolution</h4>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                        {report.resolution}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Report Details - {report.category}</DialogTitle>
                      </DialogHeader>
                      {selectedReport && selectedReport.id === report.id && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Report Information</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Category:</strong> {report.category}</div>
                                <div><strong>Priority:</strong> {report.priority}</div>
                                <div><strong>Status:</strong> {report.status}</div>
                                <div><strong>Submitted:</strong> {new Date(report.submittedDate).toLocaleDateString()}</div>
                                <div><strong>Booking ID:</strong> {report.bookingId}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-3">Reported Item</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Type:</strong> {report.reportedItem.type}</div>
                                <div><strong>Name:</strong> {report.reportedItem.name}</div>
                                {report.reportedItem.location && (
                                  <div><strong>Location:</strong> {report.reportedItem.location}</div>
                                )}
                                {report.reportedItem.owner && (
                                  <div><strong>Owner:</strong> {report.reportedItem.owner}</div>
                                )}
                                {report.reportedItem.email && (
                                  <div><strong>Email:</strong> {report.reportedItem.email}</div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Full Description</h4>
                            <p className="text-sm bg-gray-50 p-4 rounded-lg">{report.description}</p>
                          </div>

                          {report.evidence.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Evidence Files</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {report.evidence.map((file, index) => (
                                  <div key={index} className="border rounded-lg p-4 text-center">
                                    <div className="text-gray-400 mb-2">📎</div>
                                    <div className="text-xs">{file}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium mb-3">Reporter Information</h4>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {report.reportedBy.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{report.reportedBy.name}</div>
                                <div className="text-sm text-gray-600">{report.reportedBy.email}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {report.status === 'pending' && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Report - {report.category}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Resolution notes:</label>
                              <Textarea
                                placeholder="Describe how this issue was resolved..."
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogTrigger>
                              <DialogTrigger asChild>
                                <Button 
                                  onClick={() => handleResolve(report.id, resolutionNote)}
                                  disabled={!resolutionNote.trim()}
                                >
                                  Mark as Resolved
                                </Button>
                              </DialogTrigger>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <X className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Dismiss Report</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to dismiss this report? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDismiss(report.id)}>
                              Dismiss Report
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p>No reports match your current filters.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportsModeration;
