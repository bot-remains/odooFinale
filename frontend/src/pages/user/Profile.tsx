import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Eye, EyeOff } from "lucide-react";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",   
    oldPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.email?.split('@')[0] || 'Mitchell',
        email: parsedUser.email || '',
        oldPassword: "",
        newPassword: ""
      });
    }
  }, []);

  // Dummy booking data
  const bookings = [
    {
      id: 1,
      venue: "Skyline Badminton Court (Badminton)",
      date: "18 June 2025",
      time: "5:00 PM - 6:00 PM",
      location: "Rajkot, Gujarat",
      status: "Confirmed",
      type: "badminton"
    },
    {
      id: 2,
      venue: "Skyline Badminton Court (Badminton)", 
      date: "18 June 2024",
      time: "5:00 PM - 6:00 PM",
      location: "Rajkot, Gujarat",
      status: "Confirmed",
      type: "badminton"
    }
  ];

  const filteredBookings = activeTab === "bookings" ? bookings : bookings.filter(b => b.status === "Cancelled");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setFormData({
      fullName: user?.email?.split('@')[0] || 'Mitchell',
      email: user?.email || '',
      oldPassword: "",
      newPassword: ""
    });
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving profile data:', formData);
    // For now, just close the edit mode
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="My Profile – QuickCourt" description="View and update your QuickCourt profile details." />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {user?.email?.split('@')[0]?.charAt(0).toUpperCase() + 
                     user?.email?.split('@')[0]?.slice(1) || 'Mitchell'} Admin
                  </h3>
                  <p className="text-sm text-gray-600">999999999</p>
                  <p className="text-sm text-gray-600">{user?.email || 'mitchell@mitchell@gmail.com'}</p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    variant={isEditingProfile ? "default" : "outline"}
                    className={`w-full ${isEditingProfile ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant={!isEditingProfile ? "default" : "outline"}
                    className={`w-full ${!isEditingProfile ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    onClick={() => {
                      setActiveTab("bookings");
                      setIsEditingProfile(false);
                    }}
                  >
                    All Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-6">
                {isEditingProfile ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h2>
                    <div className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-600" />
                        </div>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full"
                          placeholder="Enter your email"
                        />
                      </div>

                      {/* Old Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Old Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showOldPassword ? "text" : "password"}
                            value={formData.oldPassword}
                            onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                            className="w-full pr-10"
                            placeholder="Enter your old password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                          >
                            {showOldPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            className="w-full pr-10"
                            placeholder="Enter your new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-center gap-4 pt-6">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="px-8"
                        >
                          Reset
                        </Button>
                        <Button
                          onClick={handleSave}
                          className="px-8 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-4 mb-6">
                      <Button
                        variant={activeTab === "bookings" ? "default" : "outline"}
                        className={`${activeTab === "bookings" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                        onClick={() => setActiveTab("bookings")}
                      >
                        All Bookings
                      </Button>
                      <Button
                        variant={activeTab === "cancelled" ? "default" : "outline"}
                        className={`${activeTab === "cancelled" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                        onClick={() => setActiveTab("cancelled")}
                      >
                        Cancelled
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {filteredBookings.map((booking) => (
                        <Card key={booking.id} className="bg-gray-50 border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h4 className="font-medium text-gray-900">{booking.venue}</h4>
                              </div>
                              <Badge 
                                variant="secondary"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{booking.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{booking.time}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.location}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                [Cancel Booking]
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                [Write Review]
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {filteredBookings.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No {activeTab === "cancelled" ? "cancelled" : ""} bookings found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
