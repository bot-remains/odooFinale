import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, Ban, CheckCircle, Clock, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Jane Doe",
    email: "jane.doe@email.com",
    role: "user",
    status: "active",
    joinDate: "2024-01-15",
    totalBookings: 12,
    avatar: "JD",
    location: "Mumbai, MH",
    recentBookings: [
      { id: 1, venue: "Elite Sports Complex", date: "2024-08-10", amount: 549, status: "completed" },
      { id: 2, venue: "City Sports Arena", date: "2024-08-05", amount: 899, status: "completed" },
      { id: 3, venue: "Metro Badminton Hall", date: "2024-07-28", amount: 199, status: "cancelled" },
    ]
  },
  {
    id: 2,
    name: "John Smith",
    email: "john.smith@email.com",
    role: "owner",
    status: "active",
    joinDate: "2023-11-20",
    totalBookings: 0,
    avatar: "JS",
    location: "Delhi, DL",
    venues: [
      { id: 1, name: "Smith Sports Complex", status: "approved", courts: 4 },
      { id: 2, name: "Pro Tennis Center", status: "pending", courts: 2 },
    ]
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    role: "user",
    status: "banned",
    joinDate: "2024-03-10",
    totalBookings: 8,
    avatar: "AJ",
    location: "Bangalore, KA",
    banReason: "Inappropriate behavior reported multiple times",
    recentBookings: [
      { id: 4, venue: "Royal Tennis Club", date: "2024-07-15", amount: 649, status: "completed" },
      { id: 5, venue: "Champion Sports Club", date: "2024-07-10", amount: 799, status: "completed" },
    ]
  },
  {
    id: 4,
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    role: "owner",
    status: "active",
    joinDate: "2024-02-05",
    totalBookings: 0,
    avatar: "MW",
    location: "Chennai, TN",
    venues: [
      { id: 3, name: "Wilson Badminton Arena", status: "approved", courts: 6 },
    ]
  },
  {
    id: 5,
    name: "Sarah Brown",
    email: "sarah.brown@email.com",
    role: "user",
    status: "active",
    joinDate: "2024-06-12",
    totalBookings: 5,
    avatar: "SB",
    location: "Hyderabad, TS",
    recentBookings: [
      { id: 6, venue: "Phoenix Tennis Academy", date: "2024-08-08", amount: 499, status: "completed" },
      { id: 7, venue: "Galaxy Sports Complex", date: "2024-08-01", amount: 1299, status: "upcoming" },
    ]
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBanUser = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: "banned", banReason: "Banned by admin" }
        : user
    ));
    toast({
      title: "User banned successfully",
      description: "The user has been banned from the platform.",
    });
  };

  const handleUnbanUser = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: "active", banReason: undefined }
        : user
    ));
    toast({
      title: "User unbanned successfully",
      description: "The user has been restored to active status.",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active": return "default";
      case "banned": return "destructive";
      default: return "secondary";
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "user": return "secondary";
      case "owner": return "default";
      case "admin": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="container py-10">
      <SEO title="User Management – QuickCourt" description="Search, filter, and manage users and facility owners." />
      <PageHeader title="User Management" />
      
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Filters Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search by name or email" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">👤 Users</SelectItem>
                    <SelectItem value="owner">🏢 Facility Owners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">✅ Active</SelectItem>
                    <SelectItem value="banned">🚫 Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-medium">{users.filter(u => u.role === 'user').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Facility Owners:</span>
                <span className="font-medium">{users.filter(u => u.role === 'owner').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span className="font-medium text-green-600">{users.filter(u => u.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Banned:</span>
                <span className="font-medium text-red-600">{users.filter(u => u.status === 'banned').length}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === 'user' ? '👤' : '🏢'} {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status === 'active' ? '✅' : '🚫'} {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>📅 Joined: {new Date(user.joinDate).toLocaleDateString()}</span>
                        <span>📍 {user.location}</span>
                        {user.role === 'user' && (
                          <span>🎫 {user.totalBookings} bookings</span>
                        )}
                        {user.role === 'owner' && user.venues && (
                          <span>🏟️ {user.venues.length} venues</span>
                        )}
                      </div>
                      {user.status === 'banned' && user.banReason && (
                        <p className="text-xs text-red-600 mt-1">Ban reason: {user.banReason}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>User Details - {user.name}</DialogTitle>
                        </DialogHeader>
                        {selectedUser && selectedUser.id === user.id && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Name:</span> {user.name}</div>
                                  <div><span className="font-medium">Email:</span> {user.email}</div>
                                  <div><span className="font-medium">Role:</span> {user.role}</div>
                                  <div><span className="font-medium">Status:</span> {user.status}</div>
                                  <div><span className="font-medium">Location:</span> {user.location}</div>
                                  <div><span className="font-medium">Join Date:</span> {new Date(user.joinDate).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Statistics</h4>
                                <div className="space-y-2 text-sm">
                                  {user.role === 'user' && (
                                    <div><span className="font-medium">Total Bookings:</span> {user.totalBookings}</div>
                                  )}
                                  {user.role === 'owner' && user.venues && (
                                    <div><span className="font-medium">Total Venues:</span> {user.venues.length}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {user.role === 'user' && user.recentBookings && (
                              <div>
                                <h4 className="font-medium mb-4">Recent Bookings</h4>
                                <div className="space-y-3">
                                  {user.recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <div className="font-medium">{booking.venue}</div>
                                        <div className="text-sm text-gray-600">📅 {new Date(booking.date).toLocaleDateString()}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">₹{booking.amount}</div>
                                        <Badge variant={booking.status === 'completed' ? 'default' : booking.status === 'upcoming' ? 'secondary' : 'destructive'}>
                                          {booking.status === 'completed' && '✅'}
                                          {booking.status === 'upcoming' && '⏳'}
                                          {booking.status === 'cancelled' && '❌'}
                                          {' '}{booking.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {user.role === 'owner' && user.venues && (
                              <div>
                                <h4 className="font-medium mb-4">Owned Venues</h4>
                                <div className="space-y-3">
                                  {user.venues.map((venue) => (
                                    <div key={venue.id} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <div className="font-medium">{venue.name}</div>
                                        <div className="text-sm text-gray-600">🏟️ {venue.courts} courts</div>
                                      </div>
                                      <Badge variant={venue.status === 'approved' ? 'default' : 'secondary'}>
                                        {venue.status === 'approved' ? '✅' : '⏳'} {venue.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    {user.status === 'active' ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ban User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to ban {user.name}? This will prevent them from accessing the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBanUser(user.id)}>
                              Ban User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default" size="sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Unban User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to unban {user.name}? This will restore their access to the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUnbanUser(user.id)}>
                              Unban User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">👥</div>
                  <p>No users found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
