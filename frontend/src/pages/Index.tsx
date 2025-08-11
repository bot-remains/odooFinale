import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const popularSports = [
  { name: "Badminton", image: "/placeholder.svg" },
  { name: "Football", image: "/placeholder.svg" },
  { name: "Cricket", image: "/placeholder.svg" },
  { name: "Swimming", image: "/placeholder.svg" },
  { name: "Tennis", image: "/placeholder.svg" },
  { name: "Table Tennis", image: "/placeholder.svg" },
];

const cities = [
  "Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
  "Hyderabad", "Pune", "Surat", "Rajkot", "Vadodara", "Gandhinagar"
];

const venues = [
  { id: 1, name: "SBR Badminton", rating: 4.5, reviews: 6, location: "Visakhapatnam, AP", image: "/placeholder.svg", sports: ["badminton"], tags: ["Top Rated", "Budget"] },
  { id: 2, name: "SBR Badminton", rating: 4.5, reviews: 6, location: "Visakhapatnam, AP", image: "/placeholder.svg", sports: ["badminton", "outdoor"], tags: ["Top Rated", "Budget"] },
  { id: 3, name: "SBR Badminton", rating: 4.5, reviews: 6, location: "Visakhapatnam, AP", image: "/placeholder.svg", sports: ["badminton", "outdoor"], tags: ["Top Rated", "Budget"] },
  { id: 4, name: "SBR Badminton", rating: 4.5, reviews: 6, location: "Visakhapatnam, AP", image: "/placeholder.svg", sports: ["badminton", "outdoor"], tags: ["Top Rated", "Budget"] },
  { id: 5, name: "Elite Sports Complex", rating: 4.3, reviews: 12, location: "Mumbai, MH", image: "/placeholder.svg", sports: ["badminton", "tennis"], tags: ["Premium", "AC"] },
  { id: 6, name: "City Sports Arena", rating: 4.7, reviews: 25, location: "Delhi, DL", image: "/placeholder.svg", sports: ["football", "cricket"], tags: ["Top Rated", "Large"] },
  { id: 7, name: "Royal Tennis Club", rating: 4.4, reviews: 8, location: "Bangalore, KA", image: "/placeholder.svg", sports: ["tennis", "swimming"], tags: ["Premium", "Club"] },
  { id: 8, name: "Metro Badminton Hall", rating: 4.6, reviews: 15, location: "Chennai, TN", image: "/placeholder.svg", sports: ["badminton"], tags: ["Budget", "AC"] },
  { id: 9, name: "Champion Sports Club", rating: 4.8, reviews: 30, location: "Hyderabad, TS", image: "/placeholder.svg", sports: ["badminton", "tennis"], tags: ["Top Rated", "Premium"] },
  { id: 10, name: "Ace Badminton Center", rating: 4.2, reviews: 9, location: "Pune, MH", image: "/placeholder.svg", sports: ["badminton"], tags: ["Budget", "New"] },
  { id: 11, name: "Galaxy Sports Complex", rating: 4.5, reviews: 18, location: "Surat, GJ", image: "/placeholder.svg", sports: ["multiple"], tags: ["Large", "Premium"] },
  { id: 12, name: "Phoenix Tennis Academy", rating: 4.7, reviews: 22, location: "Kolkata, WB", image: "/placeholder.svg", sports: ["tennis"], tags: ["Academy", "Top Rated"] },
  { id: 13, name: "Dream Sports Hub", rating: 4.1, reviews: 7, location: "Rajkot, GJ", image: "/placeholder.svg", sports: ["badminton", "table tennis"], tags: ["Budget", "Indoor"] },
  { id: 14, name: "Star Badminton Club", rating: 4.6, reviews: 14, location: "Vadodara, GJ", image: "/placeholder.svg", sports: ["badminton"], tags: ["Club", "AC"] },
  { id: 15, name: "Prime Sports Arena", rating: 4.9, reviews: 45, location: "Gandhinagar, GJ", image: "/placeholder.svg", sports: ["multiple"], tags: ["Top Rated", "Premium"] },
  { id: 16, name: "Victory Sports Club", rating: 4.3, reviews: 11, location: "Ahmedabad, GJ", image: "/placeholder.svg", sports: ["badminton", "tennis"], tags: ["Club", "Budget"] },
  { id: 17, name: "Thunder Badminton Hall", rating: 4.4, reviews: 16, location: "Mumbai, MH", image: "/placeholder.svg", sports: ["badminton"], tags: ["Indoor", "AC"] },
  { id: 18, name: "Falcon Sports Center", rating: 4.8, reviews: 28, location: "Delhi, DL", image: "/placeholder.svg", sports: ["multiple"], tags: ["Premium", "Large"] },
  { id: 19, name: "Eagle Tennis Court", rating: 4.2, reviews: 6, location: "Bangalore, KA", image: "/placeholder.svg", sports: ["tennis"], tags: ["Outdoor", "Budget"] },
  { id: 20, name: "Warrior Sports Complex", rating: 4.7, reviews: 33, location: "Chennai, TN", image: "/placeholder.svg", sports: ["multiple"], tags: ["Top Rated", "Premium"] },
];

const Index = () => {
  const [searchCity, setSearchCity] = useState("Ahmedabad");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const venuesPerPage = 4;
  
  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchCity.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setSearchCity(city);
    setShowSuggestions(false);
  };

  const totalPages = Math.ceil(venues.length / venuesPerPage);
  const currentVenues = venues.slice(
    currentPage * venuesPerPage, 
    (currentPage + 1) * venuesPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO title="QuickCourt – Book Sports Courts Near You" description="Find and book badminton, tennis, and turf courts near you. Compare venues, see availability, and reserve instantly with QuickCourt." />
      
      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Left Column - Search Section */}
            <div>
              <Card className="bg-white border border-gray-300 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    FIND PLAYERS & VENUES NEARBY
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Seamlessly explore sports venues and play with sports enthusiasts just like you!
                  </p>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input 
                      value={searchCity}
                      onChange={(e) => {
                        setSearchCity(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Enter city name"
                      className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                    />
                    {showSuggestions && filteredCities.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
                        {filteredCities.map((city) => (
                          <div
                            key={city}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-900"
                            onClick={() => handleCitySelect(city)}
                          >
                            <MapPin className="inline w-4 h-4 mr-2 text-gray-400" />
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Dummy Image */}
            <div>
              <Card className="bg-gray-100 border border-gray-300">
                <CardContent className="p-8 h-full flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <div className="text-4xl text-gray-400 mb-4">📷</div>
                    <span className="text-gray-500 text-lg">IMAGE</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t border-gray-300 mb-8"></div>

          {/* Book Venues Section */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book Venues</h2>
              <Button variant="link" className="text-green-600 hover:text-green-700">
                See all venues →
              </Button>
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentVenues.map((venue) => (
                  <Card key={venue.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-100 border border-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Image</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{venue.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-yellow-600 text-sm">{venue.rating}</span>
                          <span className="text-gray-500 text-sm">({venue.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{venue.location}</span>
                      </div>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {venue.sports.map((sport) => (
                          <Button key={sport} size="sm" variant="outline" className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50">
                            {sport === "badminton" ? "🏸 badminton" : 
                             sport === "outdoor" ? "🌳 Outdoor" :
                             sport === "tennis" ? "🎾 Tennis" :
                             sport === "football" ? "⚽ Football" :
                             sport === "cricket" ? "🏏 Cricket" :
                             sport === "swimming" ? "🏊 Swimming" :
                             sport === "multiple" ? "🏟️ Multiple" :
                             sport}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {venue.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-gray-200 text-gray-700 hover:bg-gray-300">
                            {tag === "Top Rated" ? "⭐ Top Rated" :
                             tag === "Budget" ? "💰 Budget" :
                             tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-8 gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-gray-700">
                  {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Sports Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Popular Sports</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularSports.map((sport) => (
                <Card key={sport.name} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Image</span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">{sport.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t border-gray-300 mb-8"></div>
        </div>
      </section>
    </div>
  );
};

export default Index;
