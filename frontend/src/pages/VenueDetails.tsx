import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock } from "lucide-react";

const VenueDetails = () => {
  const { id } = useParams();
  const venue = {
    id,
    name: `Premier Sports Arena #${id}`,
    location: "Indiranagar, Bangalore",
    rating: 4.6,
    sports: ["Badminton", "Tennis"],
    description:
      "A modern multi-sport facility with high-quality lighting, cushioned courts, and ample parking. Perfect for casual play and competitive matches.",
    price: 349,
    amenities: ["Free parking", "Drinking water", "Changing room", "First-aid"],
  };

  return (
    <>
      <SEO title={`${venue.name} – QuickCourt`} description={`Book ${venue.name}. ${venue.sports.join(", ")}. Starting ₹${venue.price}/hr in ${venue.location}.`} />
      <section className="container py-10">
        <div className="mb-6">
          <Link to="/venues" className="text-sm text-muted-foreground hover:text-foreground">← Back to Venues</Link>
        </div>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{venue.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{venue.location}</span>
                <span className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" />{venue.rating}</span>
                {venue.sports.map((s) => (<Badge key={s} variant="secondary">{s}</Badge>))}
              </div>
              <p className="max-w-prose">{venue.description}</p>
              <div>
                <h3 className="font-medium text-foreground mb-2">Amenities</h3>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {venue.amenities.map((a) => (<li key={a} className="list-disc list-inside">{a}</li>))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle>Book this venue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between"><span>Starting price</span><span className="text-foreground font-medium">₹{venue.price}/hr</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" />Choose a date and time at checkout</div>
                <Button className="w-full" variant="hero" asChild>
                  <Link to={`/booking/${venue.id}`}>Book now</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
};

export default VenueDetails;
