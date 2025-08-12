import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useVenueDetails,
  useAvailableTimeSlots,
} from "@/services/venueService";
import { useCreateBooking } from "@/services/bookingService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

const CourtBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // URL parameters from search params
  const venueId = searchParams.get("venueId");
  const courtId = searchParams.get("courtId");

  // State
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);

  // Parse and validate IDs
  const venueIdNum = venueId ? parseInt(venueId) : null;
  const courtIdNum = courtId ? parseInt(courtId) : null;

  // API calls
  const {
    data: venue,
    isLoading: venueLoading,
    error: venueError,
  } = useVenueDetails(venueIdNum || 0);
  const {
    data: availableSlots,
    isLoading: slotsLoading,
    refetch: refetchTimeSlots,
  } = useAvailableTimeSlots(courtIdNum || 0, selectedDate);
  const createBookingMutation = useCreateBooking();

  // Get the selected court from venue data
  const selectedCourt = venue?.courts?.find((c) => c.id === courtIdNum);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  }, []);

  // Validation
  useEffect(() => {
    if (!venueId || !courtId) {
      toast({
        title: "Invalid Request",
        description: "Venue ID and Court ID are required for booking",
        variant: "destructive",
      });
    }
  }, [venueId, courtId, toast]);

  // Debug: Log available slots when they change
  useEffect(() => {
    if (availableSlots) {
      console.log("Available slots updated:", availableSlots);
      console.log(
        "Number of available slots:",
        availableSlots.availableSlots?.length || 0
      );
    }
  }, [availableSlots]);

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to make a booking",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCourt || !selectedDate || !selectedTimeSlot || !courtId) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time slot",
        variant: "destructive",
      });
      return;
    }

    // Validate date is not in the past
    const bookingDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      toast({
        title: "Invalid Date",
        description: "Cannot book for past dates",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const [startTime, endTime] = selectedTimeSlot.split("-");

      // Find the selected time slot for validation
      const selectedSlot = availableSlots?.availableSlots?.find(
        (slot) =>
          `${slot.formattedStartTime}-${slot.formattedEndTime}` ===
          selectedTimeSlot
      );

      if (!selectedSlot || !selectedSlot.isAvailable) {
        toast({
          title: "Time Slot Unavailable",
          description: "The selected time slot is no longer available",
          variant: "destructive",
        });
        return;
      }

      const bookingData = {
        venueId: parseInt(venueId || "0"),
        courtId: parseInt(courtId),
        bookingDate: selectedDate,
        startTime:
          selectedSlot.startTime.split("T")[1]?.substring(0, 5) || startTime,
        endTime: selectedSlot.endTime.split("T")[1]?.substring(0, 5) || endTime,
        totalAmount: selectedCourt.pricePerHour || 0,
        notes: "",
      };

      await createBookingMutation.mutateAsync(bookingData);
      console.log("Booking created successfully, refetching time slots...");

      // Force refetch of time slots to show updated availability
      await refetchTimeSlots();
      console.log("Time slots refetched after booking");

      toast({
        title: "Booking Successful!",
        description: "Your court has been booked successfully.",
      });

      // Reset form
      setSelectedTimeSlot("");

      // Navigate to user bookings after a delay
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Failed to book the court. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const response = (
          error as {
            response?: { data?: { message?: string }; status?: number };
          }
        ).response;
        errorMessage = response?.data?.message || errorMessage;
      }

      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Generate formatted time slots from database data
  const getFormattedTimeSlots = () => {
    if (!availableSlots?.availableSlots) return [];

    return availableSlots.availableSlots.map((slot) => ({
      value: `${slot.formattedStartTime}-${slot.formattedEndTime}`,
      display: slot.formattedStartTime,
      id: slot.id,
      isAvailable: slot.isAvailable,
    }));
  };

  // Early validation for required parameters
  if (!venueId || !courtId || !venueIdNum || !courtIdNum) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Invalid Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Valid venue ID and court ID are required for booking.
          </p>
          <Button asChild>
            <Link to="/venues">← Back to Venues</Link>
          </Button>
        </div>
      </div>
    );
  }

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

  if (!venue) {
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

  if (!courtId || !selectedCourt) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Court Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The selected court is not available or doesn't exist.
          </p>
          <Button asChild>
            <Link to={`/venues/${venueId}`}>← Back to Venue</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <SEO
        title="Book Court – QuickCourt"
        description="Select court, date, and time slot to book your session."
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
          title={`Book ${
            selectedCourt.name || `${selectedCourt.sportType} Court`
          }`}
          subtitle={`${venue.name} • ${venue.location}`}
        />

        {/* Court Info Card */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {selectedCourt.name?.charAt(0) ||
                    selectedCourt.sportType?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {selectedCourt.name || `${selectedCourt.sportType} Court`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {selectedCourt.sportType}
                    </Badge>
                    <span>•</span>
                    <span className="font-medium text-green-600">
                      ₹{selectedCourt.pricePerHour}/hr
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    max={
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    } // 30 days from now
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Sport
                  </label>
                  <div className="px-3 py-2 border rounded-md bg-gray-50">
                    <Badge variant="secondary">{selectedCourt.sportType}</Badge>
                  </div>
                </div>
              </div>

              {selectedDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select a time slot
                  </label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="ml-2 text-sm">
                        Loading available slots...
                      </span>
                    </div>
                  ) : getFormattedTimeSlots().length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm">
                        No time slots available for this date.
                      </p>
                      <p className="text-xs">Please try a different date.</p>
                    </div>
                  ) : (
                    <ToggleGroup
                      type="single"
                      className="flex flex-wrap gap-2"
                      value={selectedTimeSlot}
                      onValueChange={setSelectedTimeSlot}
                    >
                      {getFormattedTimeSlots().map((slot) => (
                        <ToggleGroupItem
                          key={slot.value}
                          value={slot.value}
                          aria-label={`Time ${slot.display}`}
                          className="border data-[state=on]:bg-blue-500 data-[state=on]:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!slot.isAvailable}
                        >
                          {slot.display}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <aside>
          <Card className="surface-card sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue:</span>
                  <span className="font-medium">{venue.name}</span>
                </div>
                {selectedCourt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Court:</span>
                    <span className="font-medium">
                      {selectedCourt.name || selectedCourt.sportType + " Court"}
                    </span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedTimeSlot && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">
                      {selectedTimeSlot.replace("-", " - ")}
                    </span>
                  </div>
                )}
                {selectedCourt && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-green-600">
                      ₹{selectedCourt.pricePerHour}
                    </span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                disabled={
                  !selectedDate ||
                  !selectedTimeSlot ||
                  isBooking ||
                  !selectedCourt
                }
                onClick={handleBooking}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  "Confirm and Book"
                )}
              </Button>

              {!user && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You need to login to make a booking.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CourtBooking;
