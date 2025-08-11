import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { useVenueDetails, useUpdateVenue } from "@/services/venueService";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_AMENITIES = [
  'Parking',
  'Restrooms',
  'Changing Rooms',
  'Cafeteria',
  'First Aid',
  'Equipment Rental',
  'Lockers',
  'Shower',
  'WiFi',
  'Air Conditioning',
  'Water Cooler',
  'CCTV Security'
];

interface VenueFormData {
  name: string;
  description: string;
  address: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  amenities: string[];
}

const EditVenue = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: venue, isLoading, error } = useVenueDetails(Number(venueId));
  const updateVenueMutation = useUpdateVenue();

  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    description: '',
    address: '',
    location: '',
    contactPhone: '',
    contactEmail: '',
    amenities: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        description: venue.description || '',
        address: venue.address || '',
        location: venue.location || '',
        contactPhone: venue.contactPhone || '',
        contactEmail: venue.contactEmail || '',
        amenities: venue.amenities || []
      });
    }
  }, [venue]);

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Venue name must be at least 3 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^\d{10}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateVenueMutation.mutateAsync({
        venueId: Number(venueId),
        data: formData
      });
      
      toast({
        title: "Success!",
        description: "Venue updated successfully."
      });
      
      navigate(`/owner/venues/${venueId}`);
    } catch (error) {
      console.error('Update venue error:', error);
      toast({
        title: "Error",
        description: "Failed to update venue. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-4xl">
        <SEO title="Edit Venue – QuickCourt" description="Edit venue details." />
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate(`/owner/venues/${venueId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venue
          </Button>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="container py-10 max-w-4xl">
        <SEO title="Edit Venue – QuickCourt" description="Edit venue details." />
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/owner/venues')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venues
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load venue details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <SEO title={`Edit ${venue.name} – QuickCourt`} description="Edit venue details and settings." />
      
      <div className="flex items-center mb-8">
        <Button variant="outline" onClick={() => navigate(`/owner/venues/${venueId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Venue
        </Button>
        <div className="ml-4">
          <PageHeader title={`Edit ${venue.name}`} />
          <p className="text-gray-600 mt-2">Update your venue information and settings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Venue Information */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter venue name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="City, Area (e.g., Bangalore, Koramangala)"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your venue, facilities, and what makes it special"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter complete address with landmark"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className={errors.address ? "border-red-500" : ""}
                rows={2}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  placeholder="Enter contact phone number"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className={errors.contactPhone ? "border-red-500" : ""}
                />
                {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Enter contact email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className={errors.contactEmail ? "border-red-500" : ""}
                />
                {errors.contactEmail && <p className="text-red-500 text-sm">{errors.contactEmail}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <p className="text-sm text-gray-600">Select the amenities available at your venue</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AVAILABLE_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/owner/venues/${venueId}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateVenueMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateVenueMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditVenue;
