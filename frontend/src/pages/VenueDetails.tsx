import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Wifi, 
  Car, 
  Coffee, 
  Shield, 
  Heart, 
  Flag, 
  Users, 
  Calendar,
  MapIcon,
  StarIcon,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Loader2,
  Camera,
  Navigation,
  ExternalLink
} from "lucide-react";
import { useVenueDetails } from "@/services/venueService";
import { useVenueReviews, useCreateReview } from "@/services/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/lib/types";

const VenueDetails = () => {
  const { id } = useParams();
  const venueId = parseInt(id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for reviews and reporting
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    bookingId: 0,
    courtId: 0
  });
  const [reportData, setReportData] = useState({
    reason: "",
    description: ""
  });

  // API calls
  const { data: venue, isLoading: venueLoading, error: venueError } = useVenueDetails(venueId);
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useVenueReviews(venueId);
  const createReviewMutation = useCreateReview();

  // Only use real API data - no fallback data
  const displayVenue = venue ? {
    ...venue,
    sports: venue.available_sports || [],
    price: venue.min_price || 0,
    phone: venue.contactPhone || null,
    email: venue.contactEmail || null,
    address: venue.address || null,
    timings: venue.operatingHours ? "Variable hours" : null,
    photos: [], // Only use real photos when available in API
    coordinates: null, // Only use real coordinates when available in API
    totalReviews: venue.totalReviews || 0,
    facilities: (venue.amenities || []).map(name => ({ name, icon: Shield }))
  } : null;

  // Only use real reviews from API
  const reviews = reviewsData?.items || [];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review",
        variant: "destructive"
      });
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        venueId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        bookingId: reviewData.bookingId,
        courtId: reviewData.courtId
      });
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      });
      
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: "", bookingId: 0, courtId: 0 });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to report this venue",
        variant: "destructive"
      });
      return;
    }

    // Here you would implement the report API call
    toast({
      title: "Report Submitted",
      description: "Thank you for reporting. We'll review this venue."
    });
    
    setShowReportForm(false);
    setReportData({ reason: "", description: "" });
  };

  const renderStars = (rating: number, size = "small") => {
    const sizeClass = size === "large" ? "w-6 h-6" : "w-4 h-4";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  if (venueLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading venue details...</span>
        </div>
      </div>
    );
  }

  // Show fallback venue data even if API fails (for demo purposes)
  if (venueError || !displayVenue) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Venue Not Found</h2>
          <p className="text-muted-foreground mb-4">Unable to load venue details. The venue may not exist or the server is unavailable.</p>
          <Button asChild>
            <Link to="/venues">← Back to Venues</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={displayVenue ? `${displayVenue.name} – QuickCourt` : "Venue Details – QuickCourt"} 
        description={displayVenue ? `Book ${displayVenue.name}. ${displayVenue.sports?.join(", ") || "Sports venue"}. Starting ₹${displayVenue.price}/hr in ${displayVenue.location}.` : "Venue booking details on QuickCourt"} 
      />
      
      <section className="container py-10 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/venues" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            ← Back to Venues
          </Link>
        </div>

        {/* Venue Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayVenue.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {displayVenue.location}
                </span>
                <span className="flex items-center gap-2">
                  {renderStars(typeof displayVenue.rating === 'string' ? parseFloat(displayVenue.rating) : displayVenue.rating || 0)}
                  <span className="font-medium text-foreground">{typeof displayVenue.rating === 'string' ? parseFloat(displayVenue.rating).toFixed(1) : displayVenue.rating?.toFixed(1) || '0.0'}</span>
                  <span>({displayVenue.totalReviews || 0} reviews)</span>
                </span>
                {displayVenue.timings && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {displayVenue.timings}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Write Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </div>

          {/* Sports Tags */}
          {displayVenue.sports && displayVenue.sports.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {displayVenue.sports.map((sport) => (
                <Badge key={sport} variant="secondary" className="px-3 py-1">
                  {sport}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Column - Main Details */}
          <div className="space-y-8">
            {/* Venue Photos */}
            {displayVenue.photos && displayVenue.photos.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={displayVenue.photos[0]}
                      alt={displayVenue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {displayVenue.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {displayVenue.photos.slice(1, 5).map((photo, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={photo}
                            alt={`${displayVenue.name} photo ${i + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this venue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {displayVenue.description}
                </p>
              </CardContent>
            </Card>

            {/* Facilities & Amenities */}
            {displayVenue.facilities && displayVenue.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Facilities & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {displayVenue.facilities.map((facility, index) => {
                      const IconComponent = facility.icon || Shield;
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{facility.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            {(displayVenue.phone || displayVenue.email || displayVenue.address) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {displayVenue.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Phone</div>
                          <div className="text-sm text-muted-foreground">{displayVenue.phone}</div>
                        </div>
                      </div>
                    )}
                    {displayVenue.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-sm text-muted-foreground">{displayVenue.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {displayVenue.address && (
                    <div className="flex items-start gap-3">
                      <MapIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Address</div>
                        <div className="text-sm text-muted-foreground">{displayVenue.address}</div>
                      </div>
                    </div>
                  )}
                  {displayVenue.coordinates && (
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Get Directions
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Reviews ({reviews.length})</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Write Review
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading reviews...</span>
                  </div>
                ) : reviewsError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-500" />
                    <p>Unable to load reviews. Please try again later.</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No reviews yet. Be the first to review this venue!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {renderStars(review.rating)}
                              <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {review.helpfulCount || 0}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Sidebar */}
          <aside className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Book this venue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Starting price</span>
                  <span className="text-2xl font-bold">₹{displayVenue.price > 0 ? displayVenue.price : 'N/A'}/hr</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Choose date and time at checkout
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link to={`/booking/${displayVenue.id}`}>
                    Book Now
                  </Link>
                </Button>
                <div className="text-xs text-center text-muted-foreground">
                  You won't be charged yet
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                  </span>
                  <span className="font-medium">{typeof displayVenue.rating === 'string' ? parseFloat(displayVenue.rating).toFixed(1) : displayVenue.rating?.toFixed(1) || '0.0'}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reviews
                  </span>
                  <span className="font-medium">{displayVenue.totalReviews || reviews.length}</span>
                </div>
                {displayVenue.sports && displayVenue.sports.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Sports
                    </span>
                    <span className="font-medium">{displayVenue.sports.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className="p-1"
                      >
                        <StarIcon
                          className={`w-6 h-6 ${
                            star <= reviewData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createReviewMutation.isPending}
                  >
                    {createReviewMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Report This Venue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for reporting</Label>
                  <select
                    id="reason"
                    value={reportData.reason}
                    onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="fake_listing">Fake listing</option>
                    <option value="inappropriate_content">Inappropriate content</option>
                    <option value="safety_concerns">Safety concerns</option>
                    <option value="misleading_info">Misleading information</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={reportData.description}
                    onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                    placeholder="Please provide more details..."
                    rows={4}
                    required
                  />
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Reports are reviewed by our team. False reports may result in account suspension.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReportForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="flex-1"
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default VenueDetails;
