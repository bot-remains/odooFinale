import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Star, Filter, X, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const allVenues = [
  { id: 1, name: "SBR Badminton Arena", sports: ["Badminton"], type: "Indoor", price: 299, location: "Visakhapatnam, AP", rating: 4.5, reviews: 6, tags: ["Top Rated", "Budget", "AC"] },
  { id: 2, name: "Elite Sports Complex", sports: ["Badminton", "Tennis"], type: "Indoor", price: 549, location: "Mumbai, MH", rating: 4.3, reviews: 12, tags: ["Premium", "AC", "Parking"] },
  { id: 3, name: "City Sports Arena", sports: ["Football"], type: "Outdoor", price: 899, location: "Delhi, DL", rating: 4.7, reviews: 25, tags: ["Top Rated", "Large", "Floodlights"] },
  { id: 4, name: "Royal Tennis Club", sports: ["Tennis"], type: "Outdoor", price: 649, location: "Bangalore, KA", rating: 4.4, reviews: 8, tags: ["Premium", "Club", "Coaching"] },
  { id: 5, name: "Metro Badminton Hall", sports: ["Badminton"], type: "Indoor", price: 199, location: "Chennai, TN", rating: 4.6, reviews: 15, tags: ["Budget", "AC", "Central"] },
  { id: 6, name: "Champion Sports Club", sports: ["Badminton", "Tennis", "Table Tennis"], type: "Indoor", price: 799, location: "Hyderabad, TS", rating: 4.8, reviews: 30, tags: ["Top Rated", "Premium", "Multi-sport"] },
  { id: 7, name: "Ace Badminton Center", sports: ["Badminton"], type: "Indoor", price: 249, location: "Pune, MH", rating: 4.2, reviews: 9, tags: ["Budget", "New", "AC"] },
  { id: 8, name: "Galaxy Sports Complex", sports: ["Cricket", "Football", "Tennis"], type: "Outdoor", price: 1299, location: "Surat, GJ", rating: 4.5, reviews: 18, tags: ["Large", "Premium", "Multi-sport"] },
  { id: 9, name: "Phoenix Tennis Academy", sports: ["Tennis"], type: "Outdoor", price: 499, location: "Kolkata, WB", rating: 4.7, reviews: 22, tags: ["Academy", "Top Rated", "Coaching"] },
  { id: 10, name: "Dream Sports Hub", sports: ["Badminton", "Table Tennis"], type: "Indoor", price: 299, location: "Rajkot, GJ", rating: 4.1, reviews: 7, tags: ["Budget", "Indoor", "AC"] },
  { id: 11, name: "Star Badminton Club", sports: ["Badminton"], type: "Indoor", price: 399, location: "Vadodara, GJ", rating: 4.6, reviews: 14, tags: ["Club", "AC", "Premium"] },
  { id: 12, name: "Prime Sports Arena", sports: ["Football", "Cricket", "Hockey"], type: "Outdoor", price: 1599, location: "Gandhinagar, GJ", rating: 4.9, reviews: 45, tags: ["Top Rated", "Premium", "Large"] },
  { id: 13, name: "Victory Sports Club", sports: ["Badminton", "Tennis"], type: "Indoor", price: 349, location: "Ahmedabad, GJ", rating: 4.3, reviews: 11, tags: ["Club", "Budget", "AC"] },
  { id: 14, name: "Thunder Badminton Hall", sports: ["Badminton"], type: "Indoor", price: 279, location: "Mumbai, MH", rating: 4.4, reviews: 16, tags: ["Indoor", "AC", "Budget"] },
  { id: 15, name: "Falcon Sports Center", sports: ["Football", "Cricket", "Tennis"], type: "Outdoor", price: 1099, location: "Delhi, DL", rating: 4.8, reviews: 28, tags: ["Premium", "Large", "Multi-sport"] },
  { id: 16, name: "Eagle Tennis Court", sports: ["Tennis"], type: "Outdoor", price: 399, location: "Bangalore, KA", rating: 4.2, reviews: 6, tags: ["Outdoor", "Budget", "Natural"] },
  { id: 17, name: "Warrior Sports Complex", sports: ["Hockey", "Football"], type: "Outdoor", price: 1299, location: "Chennai, TN", rating: 4.7, reviews: 33, tags: ["Top Rated", "Premium", "Professional"] },
  { id: 18, name: "Olympic Cricket Ground", sports: ["Cricket"], type: "Outdoor", price: 1899, location: "Mumbai, MH", rating: 4.9, reviews: 41, tags: ["Top Rated", "Professional", "Large"] },
  { id: 19, name: "Hockey Champions Arena", sports: ["Hockey"], type: "Outdoor", price: 999, location: "Chandigarh, CH", rating: 4.6, reviews: 19, tags: ["Professional", "Premium", "Astro Turf"] },
  { id: 20, name: "Table Tennis Pro Center", sports: ["Table Tennis"], type: "Indoor", price: 149, location: "Kolkata, WB", rating: 4.3, reviews: 12, tags: ["Budget", "AC", "Multiple Tables"] },
];

const Venues = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState([2000]);
  const [minRating, setMinRating] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 9;
  
  const sportsList = ["Badminton", "Tennis", "Football", "Cricket", "Hockey", "Table Tennis"];
  
  // Filter venues based on selected criteria
  const filteredVenues = allVenues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSports = selectedSports.length === 0 || 
                         selectedSports.some(sport => venue.sports.includes(sport));
    
    const matchesType = selectedType === "all" || venue.type.toLowerCase() === selectedType.toLowerCase();
    
    const matchesPrice = venue.price <= priceRange[0];
    
    const matchesRating = minRating === "all" || venue.rating >= parseFloat(minRating);
    
    return matchesSearch && matchesSports && matchesType && matchesPrice && matchesRating;
  });

  // Sort venues based on selected criteria
  const sortedVenues = [...filteredVenues].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating-high":
        return b.rating - a.rating;
      case "rating-low":
        return a.rating - b.rating;
      case "popularity":
        return b.reviews - a.reviews;
      default:
        return 0; // Default order
    }
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedVenues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVenues = sortedVenues.slice(startIndex, startIndex + itemsPerPage);
  
  const handleSportToggle = (sport) => {
    setSelectedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
    setCurrentPage(1);
  };
  
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSports([]);
    setSelectedType("all");
    setPriceRange([2000]);
    setMinRating("all");
    setSortBy("default");
    setCurrentPage(1);
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedSports.length > 0) count++;
    if (selectedType !== "all") count++;
    if (priceRange[0] < 2000) count++;
    if (minRating !== "all") count++;
    if (sortBy !== "default") count++;
    return count;
  };

  return (
    <>
      <SEO title="All Venues – QuickCourt" description="Browse all approved sports venues. Filter by sport, price, location, and rating to find your perfect court." />
      <section className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Venues</h1>
            <p className="text-gray-600">
              Found {sortedVenues.length} venues matching your criteria
            </p>
          </div>
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear Filters ({getActiveFiltersCount()})
            </Button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {paginatedVenues.length} of {sortedVenues.length} venues
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                <SelectItem value="price-high">💰 Price: High to Low</SelectItem>
                <SelectItem value="rating-high">⭐ Rating: High to Low</SelectItem>
                <SelectItem value="rating-low">⭐ Rating: Low to High</SelectItem>
                <SelectItem value="popularity">🔥 Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input 
                    placeholder="Search venues or areas" 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Venue Type */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Venue Type</label>
                  <Select value={selectedType} onValueChange={(value) => {
                    setSelectedType(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="indoor">🏢 Indoor</SelectItem>
                      <SelectItem value="outdoor">🌳 Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sports */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Sports</label>
                  <div className="space-y-2">
                    {sportsList.map((sport) => (
                      <div key={sport} className="flex items-center space-x-2">
                        <Checkbox
                          id={sport}
                          checked={selectedSports.includes(sport)}
                          onCheckedChange={() => handleSportToggle(sport)}
                        />
                        <label htmlFor={sport} className="text-sm cursor-pointer">
                          {sport === "Badminton" && "🏸"} 
                          {sport === "Tennis" && "🎾"} 
                          {sport === "Football" && "⚽"} 
                          {sport === "Cricket" && "🏏"} 
                          {sport === "Hockey" && "🏑"} 
                          {sport === "Table Tennis" && "🏓"} 
                          {" " + sport}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <Select value={minRating} onValueChange={(value) => {
                    setMinRating(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Rating</SelectItem>
                      <SelectItem value="4.5">⭐ 4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">⭐ 4.0+ Stars</SelectItem>
                      <SelectItem value="3.5">⭐ 3.5+ Stars</SelectItem>
                      <SelectItem value="3.0">⭐ 3.0+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹100</span>
                    <span>₹2000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Venues Grid */}
          <div className="space-y-6">
            {sortedVenues.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium mb-2">No venues found</h3>
                  <p>Try adjusting your filters to find more venues.</p>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedVenues.map((venue) => (
                    <Card key={venue.id} className="hover:shadow-lg transition-shadow group">
                      <CardContent className="p-0">
                        {/* Image Placeholder */}
                        <div className="aspect-video bg-gray-100 border-b flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                          <span className="text-gray-500 text-sm">Venue Image</span>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg leading-tight">{venue.name}</h3>
                            <Badge variant={venue.type === "Indoor" ? "default" : "secondary"} className="text-xs">
                              {venue.type === "Indoor" ? "🏢" : "🌳"} {venue.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{venue.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{venue.rating}</span>
                            <span className="text-sm text-gray-500">({venue.reviews} reviews)</span>
                          </div>
                          
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {venue.sports.map((sport) => (
                              <Badge key={sport} variant="outline" className="text-xs">
                                {sport === "Badminton" && "🏸"} 
                                {sport === "Tennis" && "🎾"} 
                                {sport === "Football" && "⚽"} 
                                {sport === "Cricket" && "🏏"} 
                                {sport === "Hockey" && "🏑"} 
                                {sport === "Table Tennis" && "🏓"} 
                                {" " + sport}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-1 mb-4 flex-wrap">
                            {venue.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag === "Top Rated" && "⭐"} 
                                {tag === "Budget" && "💰"} 
                                {tag === "Premium" && "👑"} 
                                {tag === "AC" && "❄️"} 
                                {" " + tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-lg font-bold text-green-600">
                              ₹{venue.price}/hr
                            </div>
                            <Button asChild size="sm">
                              <Link to={`/venue/${venue.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
                      <ul className="flex items-center gap-1">
                        <li>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <li key={page}>
                            <Button
                              variant={currentPage === page ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          </li>
                        ))}
                        <li>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Venues;
