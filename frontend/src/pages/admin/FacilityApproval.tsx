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
import { Eye, CheckCircle, X, Clock, MapPin, Star, Camera, Wifi, Car, CreditCard } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock pending facility data
const mockPendingFacilities = [
  {
    id: 1,
    name: "Elite Sports Hub",
    owner: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      avatar: "RK",
      phone: "+91 98765 43210"
    },
    location: {
      address: "123 Sports Complex Road, Sector 21",
      city: "Gurgaon",
      state: "Haryana",
      pincode: "122001"
    },
    facilities: {
      courts: [
        { type: "Badminton", count: 4, price: 299 },
        { type: "Tennis", count: 2, price: 599 }
      ],
      amenities: ["AC", "Parking", "WiFi", "Changing Rooms", "Equipment Rental"],
      type: "Indoor"
    },  
    documents: [
      { name: "Business License", status: "uploaded" },
      { name: "Property Papers", status: "uploaded" },
      { name: "Insurance Certificate", status: "uploaded" }
    ],
    images: [
      "court1.jpg", "court2.jpg", "facility_exterior.jpg", "amenities.jpg"
    ],
    submittedDate: "2024-08-08",
    status: "pending"
  },
  {
    id: 2,
    name: "City Turf Grounds",
    owner: {
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      avatar: "PS",
      phone: "+91 87654 32109"
    },
    location: {
      address: "456 Green Field Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    facilities: {
      courts: [
        { type: "Football", count: 2, price: 1299 },
        { type: "Cricket", count: 1, price: 1899 }
      ],
      amenities: ["Floodlights", "Parking", "Refreshments", "Changing Rooms"],
      type: "Outdoor"
    },
    documents: [
      { name: "Business License", status: "uploaded" },
      { name: "Property Papers", status: "pending" },
      { name: "Insurance Certificate", status: "uploaded" }
    ],
    images: [
      "turf1.jpg", "turf2.jpg", "parking.jpg"
    ],
    submittedDate: "2024-08-09",
    status: "pending"
  },
  {
    id: 3,
    name: "Champions Hockey Arena",
    owner: {
      name: "Amit Singh",
      email: "amit.singh@email.com",
      avatar: "AS",
      phone: "+91 76543 21098"
    },
    location: {
      address: "789 Sports City, Block C",
      city: "Chandigarh",
      state: "Chandigarh",
      pincode: "160001"
    },
    facilities: {
      courts: [
        { type: "Hockey", count: 1, price: 999 }
      ],
      amenities: ["Astro Turf", "Professional Equipment", "Coaching", "Parking"],
      type: "Outdoor"
    },
    documents: [
      { name: "Business License", status: "uploaded" },
      { name: "Property Papers", status: "uploaded" },
      { name: "Insurance Certificate", status: "uploaded" },
      { name: "Sports Authority Clearance", status: "uploaded" }
    ],
    images: [
      "hockey_field.jpg", "equipment.jpg", "coaching_area.jpg"
    ],
    submittedDate: "2024-08-07",
    status: "under_review"
  }
];

const FacilityApproval = () => {
  const [facilities, setFacilities] = useState(mockPendingFacilities);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const filteredFacilities = facilities.filter(facility => 
    filterStatus === "all" || facility.status === filterStatus
  );

  const handleApprove = (facilityId) => {
    setFacilities(prev => prev.filter(f => f.id !== facilityId));
    toast({
      title: "Facility approved! ✅",
      description: "The facility has been approved and is now live on the platform.",
    });
  };

  const handleReject = (facilityId, reason) => {
    setFacilities(prev => prev.filter(f => f.id !== facilityId));
    toast({
      title: "Facility rejected",
      description: "The facility owner has been notified with the rejection reason.",
      variant: "destructive",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending": return "secondary";
      case "under_review": return "default";
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="w-4 h-4" />;
      case "parking": return <Car className="w-4 h-4" />;
      case "ac": return "❄️";
      default: return "✓";
    }
  };

  return (
    <div className="container py-10">
      <SEO title="Facility Approval – QuickCourt" description="Approve or reject facility registrations with comments." />
      <PageHeader title="Facility Approval" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Pending Approvals ({filteredFacilities.length})</h2>
            <p className="text-gray-600">Review and approve new facility submissions</p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="under_review">👀 Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredFacilities.map((facility) => (
          <Card key={facility.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{facility.name}</h3>
                        <Badge variant={getStatusBadgeVariant(facility.status)}>
                          {facility.status === 'pending' && '⏳'}
                          {facility.status === 'under_review' && '👀'}
                          {' '}{facility.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {facility.location.city}, {facility.location.state}
                        </span>
                        <span>📅 Submitted: {new Date(facility.submittedDate).toLocaleDateString()}</span>
                        <Badge variant="outline">
                          {facility.facilities.type === 'Indoor' ? '🏢' : '🌳'} {facility.facilities.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Owner Details</h4>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {facility.owner.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{facility.owner.name}</div>
                          <div className="text-sm text-gray-600">{facility.owner.email}</div>
                          <div className="text-sm text-gray-600">{facility.owner.phone}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Courts & Pricing</h4>
                      <div className="space-y-1">
                        {facility.facilities.courts.map((court, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{court.count}x {court.type}</span>
                            <span className="text-gray-600 ml-2">₹{court.price}/hr</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Documents</h4>
                      <div className="space-y-1">
                        {facility.documents.map((doc, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            {doc.status === 'uploaded' ? 
                              <CheckCircle className="w-4 h-4 text-green-600" /> : 
                              <Clock className="w-4 h-4 text-yellow-600" />
                            }
                            <span>{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Amenities</h4>
                    <div className="flex gap-2 flex-wrap">
                      {facility.facilities.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getAmenityIcon(amenity)} {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedFacility(facility)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Facility Details - {facility.name}</DialogTitle>
                      </DialogHeader>
                      {selectedFacility && selectedFacility.id === facility.id && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Complete Address</h4>
                              <div className="text-sm space-y-1">
                                <div>{facility.location.address}</div>
                                <div>{facility.location.city}, {facility.location.state}</div>
                                <div>PIN: {facility.location.pincode}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-3">Contact Information</h4>
                              <div className="text-sm space-y-1">
                                <div><strong>Owner:</strong> {facility.owner.name}</div>
                                <div><strong>Email:</strong> {facility.owner.email}</div>
                                <div><strong>Phone:</strong> {facility.owner.phone}</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Court Details & Pricing</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {facility.facilities.courts.map((court, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="font-medium">{court.type} Courts</div>
                                  <div className="text-sm text-gray-600">Count: {court.count}</div>
                                  <div className="text-lg font-bold text-green-600">₹{court.price}/hour</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Facility Images</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {facility.images.map((image, index) => (
                                <div key={index} className="aspect-square bg-gray-100 border rounded-lg flex items-center justify-center">
                                  <div className="text-center text-gray-500">
                                    <Camera className="w-8 h-8 mx-auto mb-2" />
                                    <div className="text-xs">{image}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">All Amenities</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {facility.facilities.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  {getAmenityIcon(amenity)}
                                  <span>{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Document Status</h4>
                            <div className="space-y-2">
                              {facility.documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {doc.status === 'uploaded' ? 
                                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                                      <Clock className="w-5 h-5 text-yellow-600" />
                                    }
                                    <span>{doc.name}</span>
                                  </div>
                                  <Badge variant={doc.status === 'uploaded' ? 'default' : 'secondary'}>
                                    {doc.status === 'uploaded' ? '✅ Uploaded' : '⏳ Pending'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Facility</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve "{facility.name}"? This facility will be live on the platform and users can start booking.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleApprove(facility.id)}>
                          Approve Facility
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Facility - {facility.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Reason for rejection:</label>
                          <Textarea
                            placeholder="Please provide a detailed reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <DialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleReject(facility.id, rejectReason)}
                              disabled={!rejectReason.trim()}
                            >
                              Reject Facility
                            </Button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredFacilities.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">🏟️</div>
              <h3 className="text-lg font-medium mb-2">No pending facilities</h3>
              <p>All facility submissions have been processed.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FacilityApproval;
