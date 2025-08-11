import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Star,
  Filter,
  X,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useVenues } from "@/services/venueService";
import { VenueSearchParams, Venue } from "@/lib/types";
import { getVenueSportImage } from "@/utils/sportImages";

const VenueCard = ({
  venue,
  isLoading,
}: {
  venue?: Venue;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="relative h-48">
          <Skeleton className="h-full w-full" />
        </div>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!venue) return null;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getVenueSportImage(
            venue.available_sports,
            venue.amenities,
            venue.name,
            venue.description
          )} 
          alt={venue.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {venue.amenities?.includes('Indoor') || venue.amenities?.includes('AC') ? 'Indoor' : 'Outdoor'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className="bg-white/90 border-white text-black"
          >
            {venue.isApproved ? "Verified" : "Pending"}
          </Badge>
        </div>
        {venue.available_sports && venue.available_sports.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="default" className="bg-blue-600 text-white">
              {venue.available_sports[0]}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-1">
          {venue.name}
        </CardTitle>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{venue.location}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {venue.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{venue.rating || 4.5}</span>
              <span className="text-sm text-gray-500">
                ({venue.totalReviews || 0})
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                ₹{venue.min_price || 300}/hr
              </p>
              <p className="text-xs text-gray-500">Starting from</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {venue.available_sports && venue.available_sports.length > 0 ? (
              // Show available sports
              venue.available_sports.slice(0, 3).map((sport: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {sport}
                </Badge>
              ))
            ) : venue.amenities?.length > 0 ? (
              // Fallback to amenities
              venue.amenities.slice(0, 3).map((amenity: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))
            ) : (
              // Default amenities
              <>
                <Badge variant="outline" className="text-xs">
                  AC
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Parking
                </Badge>
              </>
            )}
            {venue.available_sports && venue.available_sports.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.available_sports.length - 3} more
              </Badge>
            )}
          </div>

          <Button asChild className="w-full">
            <Link to={`/venue/${venue.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Venues = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("all"); // indoor/outdoor
  const [priceRange, setPriceRange] = useState([2000]);
  const [minRating, setMinRating] = useState("all");
  const [sortBy, setSortBy] = useState<
    "rating" | "price" | "distance" | "name"
  >("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // New sort order state
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

  // Extended sports list as requested
  const availableSports = [
    "Cricket",
    "Football", 
    "Volleyball",
    "Tennis",
    "Swimming",
    "Table Tennis",
    "Badminton",
    "Basketball",
    "Hockey",
    "Squash"
  ];

  // Prepare search parameters
  const searchParams: VenueSearchParams = useMemo(() => {
    const params: VenueSearchParams = {
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      sortBy,
      sortOrder, // Include sort order
    };

    if (searchQuery) params.search = searchQuery;
    if (selectedSports.length > 0) params.sportType = selectedSports[0]; // API might accept only one sport
    if (selectedType !== "all") params.venueType = selectedType; // indoor/outdoor filter
    if (minRating !== "all") params.minRating = parseFloat(minRating);
    if (priceRange[0] < 2000) params.maxPrice = priceRange[0];

    return params;
  }, [searchQuery, selectedSports, selectedType, minRating, priceRange, sortBy, sortOrder, currentPage]);

  // Fetch data using React Query
  const {
    data: venuesData,
    isLoading: venuesLoading,
    error: venuesError,
    refetch,
  } = useVenues(searchParams);

  // Handle loading and error states
  if (venuesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load venues. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const venues = venuesData?.items || [];
  const totalVenues = venuesData?.pagination?.total || 0;
  const hasNextPage = venuesData?.pagination?.hasNext || false;

  const handleSportToggle = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSports([]);
    setSelectedType("all");
    setPriceRange([2000]);
    setMinRating("all");
    setSortBy("rating");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedSports.length > 0) count++;
    if (selectedType !== "all") count++;
    if (priceRange[0] < 2000) count++;
    if (minRating !== "all") count++;
    return count;
  };

  return (
    <>
      <SEO
        title="All Venues – QuickCourt"
        description="Browse all approved sports venues. Filter by sport, price, location, and rating to find your perfect court."
      />
      <section className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Venues</h1>
            <p className="text-gray-600">
              {venuesLoading
                ? "Loading venues..."
                : `Found ${totalVenues} venues`}
            </p>
          </div>

          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear Filters ({getActiveFiltersCount()})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Search
                  </label>
                  <Input
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Sports Filter */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Sports
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableSports.map((sport) => (
                      <div
                        key={sport}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={sport}
                          checked={selectedSports.includes(sport)}
                          onCheckedChange={() => handleSportToggle(sport)}
                        />
                        <Label
                          htmlFor={sport}
                          className="text-sm cursor-pointer"
                        >
                          {sport}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Venue Type Filter (Indoor/Outdoor) */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Venue Type
                  </label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => {
                      setSelectedType(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Max Price: ₹{priceRange[0]}/hour
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => {
                      setPriceRange(value);
                      setCurrentPage(1);
                    }}
                    max={2000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Rating
                  </label>
                  <Select
                    value={minRating}
                    onValueChange={(value) => {
                      setMinRating(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any rating</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4.0">4.0+ stars</SelectItem>
                      <SelectItem value="3.5">3.5+ stars</SelectItem>
                      <SelectItem value="3.0">3.0+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Venues Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select
                  value={sortBy}
                  onValueChange={(
                    value: "rating" | "price" | "distance" | "name"
                  ) => setSortBy(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortOrder}
                  onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">High to Low</SelectItem>
                    <SelectItem value="asc">Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {totalVenues} results
              </Button>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {venuesLoading ? (
                // Loading skeletons
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <VenueCard key={index} isLoading />
                ))
              ) : venues.length > 0 ? (
                venues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    No venues found matching your criteria
                  </p>
                  <Button onClick={resetFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!venuesLoading && venues.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(totalVenues / itemsPerPage)}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Venues;
