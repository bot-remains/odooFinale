import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Users,
  Calendar,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useVenueDetails } from "@/services/venueService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const VenueBooking = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // API calls
  const {
    data: venue,
    isLoading: venueLoading,
    error: venueError,
  } = useVenueDetails(parseInt(venueId || "0"));

  const handleCourtSelection = (courtId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to make a booking",
        variant: "destructive",
      });
      return;
    }

    navigate(`/booking/court?venueId=${venueId}&courtId=${courtId}`);
  };

  if (venueLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Venue Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load venue details.
          </p>
          <Button asChild>
            <Link to="/venues">← Back to Venues</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <SEO
        title={`Book ${venue.name} – QuickCourt`}
        description={`Select a court and book your session at ${venue.name}`}
      />

      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/venues/${venueId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {venue.name}
        </Link>
        <PageHeader
          title="Select a Court"
          subtitle={`Choose from available courts at ${venue.name}`}
        />
      </div>

      {/* Venue Info Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-xl">
                {venue.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{venue.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{venue.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{venue.rating}</span>
                    <span>({venue.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courts Section */}
      {venue.courts && venue.courts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {venue.courts.map((court) => (
              <Card
                key={court.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCourtSelection(court.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {court.name?.charAt(0) ||
                          court.sportType?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {court.name || `${court.sportType} Court`}
                          </h3>
                          <Badge variant="secondary">{court.sportType}</Badge>
                          {court.isActive ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Unavailable</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Capacity: {court.capacity || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-green-600 font-medium">
                              ₹{court.pricePerHour}/hr
                            </span>
                          </div>
                        </div>

                        {court.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {court.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₹{court.pricePerHour}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per hour
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!court.isActive}
                        className="ml-2"
                      >
                        Book Court
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // No courts available
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>No courts available</strong> - This venue hasn't set up
              any courts yet. Please contact the venue directly or try another
              venue.
            </AlertDescription>
          </Alert>

          {/* Show available sports as fallback */}
          {venue.available_sports && venue.available_sports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Sports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.available_sports.map((sport, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {sport.toLowerCase() === "badminton"
                            ? "🏸"
                            : sport.toLowerCase() === "tennis"
                            ? "🎾"
                            : sport.toLowerCase() === "football"
                            ? "⚽"
                            : sport.toLowerCase() === "cricket" ||
                              sport.toLowerCase().includes("cricket")
                            ? "🏏"
                            : sport.toLowerCase() === "swimming"
                            ? "🏊"
                            : sport.toLowerCase() === "table tennis"
                            ? "🏓"
                            : "🏟️"}
                        </span>
                      </div>
                      <span className="font-medium capitalize">{sport}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Contact the venue:</strong>{" "}
                    {venue.contactPhone || venue.contactEmail}
                    to inquire about booking these sports.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button asChild variant="outline">
              <Link to="/venues">← Browse Other Venues</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Quick Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Booking Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operating Hours:</span>
              <span>7:00 AM - 11:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advance Booking:</span>
              <span>Up to 30 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cancellation:</span>
              <span>Free up to 2 hours before</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact:</span>
              <span>{venue.contactPhone || venue.contactEmail}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VenueBooking;
