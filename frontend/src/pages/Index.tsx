import SEO from "@/components/SEO";
import SignatureGlow from "@/components/SignatureGlow";
import hero from "@/assets/hero-quickcourt.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Calendar, Star } from "lucide-react";

const highlights = [
  { title: "Book nearby courts", desc: "Badminton, tennis, turf, and more.", icon: <MapPin className="text-primary" /> },
  { title: "Plan your match", desc: "Pick times that work for everyone.", icon: <Calendar className="text-primary" /> },
  { title: "Top-rated venues", desc: "Discover popular places to play.", icon: <Star className="text-primary" /> },
];

const Index = () => {
  return (
    <>
      <SEO title="QuickCourt – Book Sports Courts Near You" description="Find and book badminton, tennis, and turf courts near you. Compare venues, see availability, and reserve instantly with QuickCourt." />
      <section className="relative overflow-hidden">
        <div className="container grid lg:grid-cols-2 gap-10 items-center py-16">
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Find. Book. Play.</h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-prose">QuickCourt helps you discover nearby sports facilities and reserve courts in seconds. Simple, fast, and reliable for everyday play and weekend tournaments.</p>
            <div className="flex gap-3">
              <Button asChild variant="hero">
                <Link to="/venues">Explore Venues</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/signup"><Search className="mr-2" />Get Started</Link>
              </Button>
            </div>
            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {highlights.map((h) => (
                <Card key={h.title} className="surface-card">
                  <CardHeader className="pb-2 flex flex-row items-center gap-3">
                    {h.icon}
                    <CardTitle className="text-base">{h.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">{h.desc}</CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden ring-1 ring-border">
            <img src={hero} alt="Sports courts hero - badminton, tennis, and turf" loading="eager" className="w-full h-full object-cover" />
            <SignatureGlow />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-6">Popular near you</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Premier Sports Arena #{i}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Indiranagar, Bangalore</div>
                  <div className="mt-2 flex items-center gap-2"><Star className="h-4 w-4 text-primary" />4.{i} • Badminton, Tennis</div>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link to={`/venue/${i}`}>View details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
