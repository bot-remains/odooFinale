import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, ChevronLeft, ChevronRight, Navigation, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useVenues, usePopularVenues, useSports } from "@/services/venueService";
import heroImage from "@/assets/hero-quickcourt.jpg";

const cities = [
  "Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
  "Hyderabad", "Pune", "Surat", "Rajkot", "Vadodara", "Gandhinagar"
];

// Helper function to get sport emoji
const getSportEmoji = (sportName: string) => {
  const sport = sportName.toLowerCase();
  switch (sport) {
    case 'badminton': return '🏸';
    case 'tennis': return '🎾';
    case 'football': return '⚽';
    case 'cricket': return '🏏';
    case 'swimming': return '🏊';
    case 'table tennis': return '🏓';
    case 'basketball': return '🏀';
    case 'volleyball': return '🏐';
    default: return '🏟️';
  }
};

// Helper function to get sport description
const getSportDescription = (sportName: string) => {
  const sport = sportName.toLowerCase();
  switch (sport) {
    case 'badminton': return 'Indoor racquet sport with shuttlecock';
    case 'tennis': return 'Racquet sport on court';
    case 'football': return 'Team sport played with feet';
    case 'cricket': return 'Bat and ball sport with wickets';
    case 'swimming': return 'Aquatic sport and exercise';
    case 'table tennis': return 'Indoor paddle sport';
    case 'basketball': return 'Team sport with hoops';
    case 'volleyball': return 'Team sport with net';
    default: return 'Popular sport activity';
  }
};

const Index = () => {
  const [searchCity, setSearchCity] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  // API hooks
  const { data: venuesData, isLoading: venuesLoading, error: venuesError } = useVenues({
    location: searchCity || undefined,
    limit: 20,
    offset: 0,
  });
  
  const { data: popularVenuesData, isLoading: popularVenuesLoading } = usePopularVenues("rating", 12);
  
  const { data: sportsData, isLoading: sportsLoading } = useSports();

  // Debug API responses
  useEffect(() => {
    if (popularVenuesData) {
      console.log("Popular venues data:", popularVenuesData);
      console.log("Venues array:", (popularVenuesData as any)?.venues);
      console.log("Processed venues:", Array.isArray((popularVenuesData as any)?.venues) ? (popularVenuesData as any).venues : []);
    }
    console.log("Sports data:", sportsData);
    console.log("Sports data type:", typeof sportsData);
    console.log("Is sports data array:", Array.isArray(sportsData));
    console.log("Sports loading:", sportsLoading);
  }, [popularVenuesData, sportsData, sportsLoading]);

  const venuesPerPage = 4;
  
  // Get user's current location on component mount
  useEffect(() => {
    detectCurrentLocation();
  }, []);
  
  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to get city name using a free API (ipapi.co as fallback)
          try {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
              const data = await response.json();
              const city = data.city || data.region || "Your Location";
              
              setCurrentLocation(city);
              setSearchCity(city);
              
              toast({
                title: "Location detected",
                description: `Your current location: ${city}`,
              });
              setIsDetectingLocation(false);
              return;
            }
          } catch (apiError) {
            console.log("API fallback failed, using coordinate approximation");
          }
          
          // Fallback to approximate location based on coordinates
          const approximateCity = getApproximateCity(latitude, longitude);
          setCurrentLocation(approximateCity);
          setSearchCity(approximateCity);
          
          toast({
            title: "Location detected",
            description: `Approximate location: ${approximateCity}`,
          });
        } catch (error) {
          console.error("Error getting location name:", error);
          setCurrentLocation("Current Location");
          setSearchCity("Current Location");
          
          toast({
            title: "Location detected",
            description: "We found your location but couldn't determine the city name.",
          });
        }
        
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Fallback to default city
        setSearchCity("Ahmedabad");
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };
  
  // Simple function to get approximate city based on coordinates
  const getApproximateCity = (lat: number, lng: number) => {
    // This is a simplified example - in practice, you'd use a more comprehensive database
    const cityCoordinates = [
      { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
      { name: "Delhi", lat: 28.6139, lng: 77.2090 },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
      { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
      { name: "Pune", lat: 18.5204, lng: 73.8567 },
      { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    ];
    
    let closestCity = "Your Location";
    let minDistance = Infinity;
    
    cityCoordinates.forEach(city => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city.name;
      }
    });
    
    return closestCity;
  };
  
  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchCity.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setSearchCity(city);
    setShowSuggestions(false);
  };

  // Process venues data from API
  const venues = Array.isArray((popularVenuesData as any)?.venues) ? (popularVenuesData as any).venues : [];
  const totalPages = Math.ceil(venues.length / venuesPerPage);
  const currentVenues = venues.slice(
    currentPage * venuesPerPage, 
    (currentPage + 1) * venuesPerPage
  );

  // Process sports data from API
  const fallbackSports = [
    { 
      name: "Badminton", 
      image: "/badminton.jpg", 
      id: 1,
    },
    { 
      name: "Football", 
      image: "/football.jpg", 
      id: 2,
    },
    { 
      name: "Cricket", 
      image: "/cricket.jpg", 
      id: 3,
    },
    { 
      name: "Swimming", 
      image: "/swimming.webp", 
      id: 4,
    },
    { 
      name: "Tennis", 
      image: "/tennis.avif", 
      id: 5,
    },
    { 
      name: "Table Tennis", 
      image: "/table_tennis.jpg", 
      id: 6,
    },
  ];

  const popularSports = (Array.isArray(sportsData) && sportsData.length > 0) ? sportsData.map(sport => ({
    name: sport.name,
    image: `/${sport.name.toLowerCase().replace(/\s+/g, '_')}.jpg`,
    id: sport.id,
    description: getSportDescription(sport.name)
  })) : fallbackSports;

  const nextPage = () => {
    if (venues.length > 0) {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }
  };

  const prevPage = () => {
    if (venues.length > 0) {
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    }
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
                  <div className="relative mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input 
                          value={searchCity}
                          onChange={(e) => {
                            setSearchCity(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder={currentLocation ? `Current: ${currentLocation}` : "Enter city name"}
                          className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                        {showSuggestions && filteredCities.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
                            {currentLocation && (
                              <div
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-900 border-b border-gray-100"
                                onClick={() => handleCitySelect(currentLocation)}
                              >
                                <Navigation className="inline w-4 h-4 mr-2 text-green-500" />
                                {currentLocation} (Current Location)
                              </div>
                            )}
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
                      <Button 
                        variant="outline" 
                        onClick={detectCurrentLocation}
                        disabled={isDetectingLocation}
                        className="px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                        title="Detect current location"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    FIND PLAYERS & VENUES NEARBY
                  </h2>
                  {currentLocation && (
                    <p className="text-sm text-green-600 mb-2 flex items-center">
                      <Navigation className="w-4 h-4 mr-1" />
                      Current location: {currentLocation}
                    </p>
                  )}
                  <p className="text-gray-600">
                    Seamlessly explore sports venues and play with sports enthusiasts just like you!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Hero Image */}
            <div>
              <Card className="bg-gray-100 border border-gray-300 overflow-hidden h-full">
                <CardContent className="p-0 h-full min-h-[300px] flex">
                  <img 
                    src={heroImage} 
                    alt="QuickCourt Sports Facilities - Modern sports courts and facilities" 
                    className="w-full h-full object-cover flex-1"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      // Show fallback content if image fails to load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full flex items-center justify-center min-h-[300px] bg-gradient-to-br from-green-100 to-blue-100';
                      fallback.innerHTML = `
                        <div class="text-center">
                          <div class="text-4xl text-green-600 mb-4">🏟️</div>
                          <span class="text-gray-600 text-lg font-medium">Sports Courts & Facilities</span>
                        </div>
                      `;
                      target.parentElement?.appendChild(fallback);
                    }}
                  />
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
              <Button variant="link" className="text-green-600 hover:text-green-700" asChild>
                <Link to="/venues">
                  See all venues →
                </Link>
              </Button>
            </div>
            <div className="relative">
              {venuesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Loading venues...</span>
                </div>
              ) : venuesError ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Failed to load venues. Please try again.</p>
                </div>
              ) : currentVenues.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No venues found in your area.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentVenues.map((venue) => (
                    <Link key={venue.id} to={`/venue/${venue.id}`}>
                      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-100 border border-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                            {venue.photos && venue.photos.length > 0 ? (
                              <img 
                                src={venue.photos[0]} 
                                alt={venue.name}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <span className="text-gray-500">🏟️ Venue</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{venue.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-yellow-600 text-sm">
                              {venue.rating && venue.rating !== "0.0" ? parseFloat(venue.rating).toFixed(1) : 'New'}
                            </span>
                            <span className="text-gray-500 text-sm">({venue.total_reviews || 0})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{venue.location}</span>
                        </div>
                        <div className="text-gray-600 text-xs mb-3 line-clamp-2">
                          {venue.description}
                        </div>
                        
                        {/* Amenities */}
                        {venue.amenities && venue.amenities.length > 0 && (
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {venue.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                                {amenity === "parking" ? "�️ Parking" :
                                 amenity === "wifi" ? "📶 WiFi" :
                                 amenity === "refreshments" ? "🥤 Refreshments" :
                                 amenity === "equipment_rental" ? "� Equipment" :
                                 `✨ ${amenity}`}
                              </Badge>
                            ))}
                            {venue.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                                +{venue.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                          <span>📞 {venue.contact_phone}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {venue.is_approved && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-200">
                              ✅ Verified
                            </Badge>
                          )}
                          {venue.rating && parseFloat(venue.rating) >= 4.5 && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                              ⭐ Top Rated
                            </Badge>
                          )}
                          {venue.min_price && venue.min_price < 500 && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                              💰 Budget Friendly
                            </Badge>
                          )}
                          {venue.courts_count && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200">
                              🏟️ {venue.courts_count} Courts
                            </Badge>
                          )}
                        </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Pagination Controls - Only show if there are venues */}
              {!venuesLoading && !venuesError && venues.length > 0 && totalPages > 1 && (
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
                    {currentPage + 1} of {totalPages || 1}
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
              )}
            </div>
          </div>

          {/* Popular Sports Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Popular Sports</h2>
            
            {/* Always show sports - bypassing loading state for now */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {fallbackSports.map((sport) => (
                <Link key={sport.id || sport.name} to={`/venues?sport=${encodeURIComponent(sport.name.toLowerCase())}`}>
                  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg mb-3 overflow-hidden group-hover:from-green-50 group-hover:to-blue-50 transition-colors duration-300">
                        <img 
                          src={sport.image} 
                          alt={sport.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback if image doesn't load
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-content')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-content w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50';
                              fallback.innerHTML = `
                                <div class="text-center p-2">
                                  <div class="text-3xl mb-2">${getSportEmoji(sport.name)}</div>
                                  <span class="text-gray-600 text-xs font-medium">${sport.name}</span>
                                </div>
                              `;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-green-600 transition-colors">
                        {sport.name}
                      </h3>
                      
                      {/* Sport-specific badges */}
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {sport.name.toLowerCase() === 'cricket' && (
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                            🏏 Popular in India
                          </Badge>
                        )}
                        {sport.name.toLowerCase() === 'tennis' && (
                          <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                            🎾 Professional Sport
                          </Badge>
                        )}
                        {sport.name.toLowerCase() === 'table tennis' && (
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                            🏓 Indoor Fun
                          </Badge>
                        )}
                        {sport.name.toLowerCase() === 'swimming' && (
                          <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700 bg-cyan-50">
                            🏊 Health & Fitness
                          </Badge>
                        )}
                        {sport.name.toLowerCase() === 'badminton' && (
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                            🏸 Easy to Learn
                          </Badge>
                        )}
                        {sport.name.toLowerCase() === 'football' && (
                          <Badge variant="outline" className="text-xs border-red-200 text-red-700 bg-red-50">
                            ⚽ Team Sport
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
