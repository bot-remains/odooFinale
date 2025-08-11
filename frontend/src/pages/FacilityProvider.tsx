import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Building, MapPin, Star, Users, Calendar, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// Mock facility provider data
const mockProviders = [
  {
    id: 1,
    name: "Sports Hub Solutions",
    owner: {
      name: "Rajesh Kumar",
      email: "rajesh@sportshub.com",
      avatar: "RK",
      phone: "+91 98765 43210"
    },
    location: "Mumbai, Maharashtra",
    joinDate: "2023-08-15",
    status: "active",
    totalVenues: 5,
    totalBookings: 1250,
    monthlyRevenue: 185000,
    rating: 4.6,
    venues: [
      { id: 1, name: "Elite Sports Complex", status: "approved", courts: 4, sport: "Badminton", bookings: 350 },
      { id: 2, name: "Pro Tennis Center", status: "approved", courts: 2, sport: "Tennis", bookings: 280 },
      { id: 3, name: "Basketball Arena", status: "pending", courts: 1, sport: "Basketball", bookings: 0 },
    ],
    specializations: ["Badminton", "Tennis", "Basketball"],
    verified: true,
    featured: true
  },
  {
    id: 2,
    name: "City Sports Networks",
    owner: {
      name: "Priya Sharma",
      email: "priya@citysports.com",
      avatar: "PS",
      phone: "+91 87654 32109"
    },
    location: "Delhi, Delhi",
    joinDate: "2024-01-20",
    status: "active",
    totalVenues: 8,
    totalBookings: 2100,
    monthlyRevenue: 320000,
    rating: 4.8,
    venues: [
      { id: 4, name: "Football Turf Ground", status: "approved", courts: 2, sport: "Football", bookings: 450 },
      { id: 5, name: "Cricket Practice Net", status: "approved", courts: 3, sport: "Cricket", bookings: 380 },
      { id: 6, name: "Multi-Sport Complex", status: "approved", courts: 6, sport: "Multiple", bookings: 520 },
    ],
    specializations: ["Football", "Cricket", "Multi-Sport"],
    verified: true,
    featured: true
  },
  {
    id: 3,
    name: "Fitness & Sports Co.",
    owner: {
      name: "Amit Singh",
      email: "amit@fitnesssports.com",
      avatar: "AS",
      phone: "+91 76543 21098"
    },
    location: "Bangalore, Karnataka",
    joinDate: "2024-03-10",
    status: "active",
    totalVenues: 3,
    totalBookings: 650,
    monthlyRevenue: 95000,
    rating: 4.3,
    venues: [
      { id: 7, name: "Badminton Plus", status: "approved", courts: 4, sport: "Badminton", bookings: 290 },
      { id: 8, name: "Table Tennis Hub", status: "approved", courts: 8, sport: "Table Tennis", bookings: 220 },
      { id: 9, name: "Swimming Pool", status: "under_review", courts: 1, sport: "Swimming", bookings: 0 },
    ],
    specializations: ["Badminton", "Table Tennis", "Swimming"],
    verified: false,
    featured: false
  },
  {
    id: 4,
    name: "Premium Sports Facilities",
    owner: {
      name: "Sarah Johnson",
      email: "sarah@premiumsports.com",
      avatar: "SJ",
      phone: "+91 65432 10987"
    },
    location: "Chennai, Tamil Nadu",
    joinDate: "2023-12-05",
    status: "active",
    totalVenues: 6,
    totalBookings: 1800,
    monthlyRevenue: 275000,
    rating: 4.7,
    venues: [
      { id: 10, name: "Tennis Academy", status: "approved", courts: 4, sport: "Tennis", bookings: 420 },
      { id: 11, name: "Hockey Field", status: "approved", courts: 1, sport: "Hockey", bookings: 180 },
      { id: 12, name: "Indoor Badminton", status: "approved", courts: 6, sport: "Badminton", bookings: 380 },
    ],
    specializations: ["Tennis", "Hockey", "Badminton"],
    verified: true,
    featured: false
  }
];

const FacilityProvider = () => {
  const [providers, setProviders] = useState(mockProviders);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState(null);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = filterLocation === "all" || provider.location.includes(filterLocation);
    const matchesStatus = filterStatus === "all" || provider.status === filterStatus;
    
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "suspended": return "destructive";
      default: return "outline";
    }
  };

  const totalStats = providers.reduce((acc, provider) => ({
    totalProviders: acc.totalProviders + 1,
    totalVenues: acc.totalVenues + provider.totalVenues,
    totalBookings: acc.totalBookings + provider.totalBookings,
    totalRevenue: acc.totalRevenue + provider.monthlyRevenue
  }), { totalProviders: 0, totalVenues: 0, totalBookings: 0, totalRevenue: 0 });

  return (
    <div className="container py-10">
      <SEO title="Facility Providers – QuickCourt" description="Manage and view all facility providers on the platform." />
      <PageHeader title="Facility Providers" />
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Providers</p>
                <p className="text-2xl font-bold">{totalStats.totalProviders}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Venues</p>
                <p className="text-2xl font-bold">{totalStats.totalVenues}</p>
              </div>
              <div className="text-2xl">🏟️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{totalStats.totalBookings.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">₹{(totalStats.totalRevenue / 100000).toFixed(1)}L</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Providers ({filteredProviders.length})</h2>
            <p className="text-gray-600">Manage facility providers and their venues</p>
          </div>
          <Button asChild>
            <Link to="/add-provider">
              <Plus className="w-4 h-4 mr-2" />
              Add New Provider
            </Link>
          </Button>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search providers, owners, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Chennai">Chennai</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">✅ Active</SelectItem>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="suspended">🚫 Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Providers List */}
      <div className="space-y-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {provider.owner.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{provider.name}</h3>
                        <Badge variant={getStatusBadgeVariant(provider.status)}>
                          {provider.status === 'active' && '✅'}
                          {provider.status === 'pending' && '⏳'}
                          {provider.status === 'suspended' && '🚫'}
                          {' '}{provider.status.toUpperCase()}
                        </Badge>
                        {provider.verified && (
                          <Badge variant="default" className="bg-blue-600">
                            ✓ Verified
                          </Badge>
                        )}
                        {provider.featured && (
                          <Badge variant="default" className="bg-yellow-600">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {provider.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {provider.rating}
                        </span>
                        <span>📅 Joined: {new Date(provider.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{provider.totalVenues}</div>
                      <div className="text-sm text-blue-600">Total Venues</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{provider.totalBookings}</div>
                      <div className="text-sm text-green-600">Total Bookings</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">₹{(provider.monthlyRevenue / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-purple-600">Monthly Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{provider.rating}</div>
                      <div className="text-sm text-yellow-600">Average Rating</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Specializations</h4>
                    <div className="flex gap-2 flex-wrap">
                      {provider.specializations.map((sport, index) => (
                        <Badge key={index} variant="outline">
                          {sport === "Badminton" && "🏸"} 
                          {sport === "Tennis" && "🎾"} 
                          {sport === "Football" && "⚽"} 
                          {sport === "Cricket" && "🏏"} 
                          {sport === "Basketball" && "🏀"} 
                          {sport === "Swimming" && "🏊"} 
                          {sport === "Table Tennis" && "🏓"} 
                          {sport === "Hockey" && "🏑"} 
                          {sport === "Multi-Sport" && "🏟️"} 
                          {" " + sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Owner:</strong> {provider.owner.name}</div>
                      <div><strong>Email:</strong> {provider.owner.email}</div>
                      <div><strong>Phone:</strong> {provider.owner.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedProvider(provider)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Provider Details - {provider.name}</DialogTitle>
                      </DialogHeader>
                      {selectedProvider && selectedProvider.id === provider.id && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Provider Information</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Company:</strong> {provider.name}</div>
                                <div><strong>Owner:</strong> {provider.owner.name}</div>
                                <div><strong>Email:</strong> {provider.owner.email}</div>
                                <div><strong>Phone:</strong> {provider.owner.phone}</div>
                                <div><strong>Location:</strong> {provider.location}</div>
                                <div><strong>Join Date:</strong> {new Date(provider.joinDate).toLocaleDateString()}</div>
                                <div><strong>Status:</strong> {provider.status}</div>
                                <div><strong>Rating:</strong> {provider.rating} ⭐</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-3">Business Metrics</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Total Venues:</strong> {provider.totalVenues}</div>
                                <div><strong>Total Bookings:</strong> {provider.totalBookings}</div>
                                <div><strong>Monthly Revenue:</strong> ₹{provider.monthlyRevenue.toLocaleString()}</div>
                                <div><strong>Verified:</strong> {provider.verified ? '✅ Yes' : '❌ No'}</div>
                                <div><strong>Featured:</strong> {provider.featured ? '⭐ Yes' : '❌ No'}</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Venue Portfolio</h4>
                            <div className="space-y-3">
                              {provider.venues.map((venue) => (
                                <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
                                  <div>
                                    <div className="font-medium">{venue.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {venue.courts} {venue.sport} courts • {venue.bookings} bookings
                                    </div>
                                  </div>
                                  <Badge variant={venue.status === 'approved' ? 'default' : venue.status === 'pending' ? 'secondary' : 'outline'}>
                                    {venue.status === 'approved' && '✅'}
                                    {venue.status === 'pending' && '⏳'}
                                    {venue.status === 'under_review' && '👀'}
                                    {' '}{venue.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Specializations</h4>
                            <div className="flex gap-2 flex-wrap">
                              {provider.specializations.map((sport, index) => (
                                <Badge key={index} variant="outline" className="text-sm">
                                  {sport === "Badminton" && "🏸"} 
                                  {sport === "Tennis" && "🎾"} 
                                  {sport === "Football" && "⚽"} 
                                  {sport === "Cricket" && "🏏"} 
                                  {sport === "Basketball" && "🏀"} 
                                  {sport === "Swimming" && "🏊"} 
                                  {sport === "Table Tennis" && "🏓"} 
                                  {sport === "Hockey" && "🏑"} 
                                  {sport === "Multi-Sport" && "🏟️"} 
                                  {" " + sport}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button asChild size="sm" variant="default">
                    <Link to={`/provider/${provider.id}/manage`}>
                      <Building className="w-4 h-4 mr-1" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProviders.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-medium mb-2">No providers found</h3>
              <p>No facility providers match your search criteria.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FacilityProvider;
