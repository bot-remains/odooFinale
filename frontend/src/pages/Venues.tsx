import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

const mockVenues = [
  { id: 1, name: "Smash & Serve Arena", sports: ["Badminton", "Tennis"], price: 299, location: "HSR Layout", rating: 4.6 },
  { id: 2, name: "City Turf Grounds", sports: ["Football"], price: 499, location: "Koramangala", rating: 4.4 },
  { id: 3, name: "Ace Courts", sports: ["Tennis"], price: 349, location: "Indiranagar", rating: 4.7 },
  { id: 4, name: "Courtside Hub", sports: ["Badminton", "Table Tennis"], price: 249, location: "Whitefield", rating: 4.3 },
];

const Venues = () => {
  return (
    <>
      <SEO title="Venues – QuickCourt" description="Browse all approved sports venues. Filter by sport, price, and rating to find your perfect court." />
      <section className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Venues</h1>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm">Search</label>
              <Input placeholder="Search venues or areas" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Sport</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sports</SelectItem>
                  <SelectItem value="badminton">Badminton</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="football">Football (turf)</SelectItem>
                  <SelectItem value="table-tennis">Table Tennis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Max price / hour</label>
              <Slider defaultValue={[500]} max={1000} step={50} />
            </div>
            <Button variant="outline" className="w-full">Reset filters</Button>
          </aside>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockVenues.map((v) => (
              <Card key={v.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{v.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{v.location}</div>
                  <div className="mt-1">{v.sports.join(", ")}</div>
                  <div className="mt-1">Starting ₹{v.price}/hr</div>
                  <div className="mt-2 flex items-center gap-2"><Star className="h-4 w-4 text-primary" />{v.rating}</div>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link to={`/venue/${v.id}`}>View details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
              <ul className="flex items-center gap-1">
                <li><Link className="inline-flex h-10 items-center gap-1 rounded-md border px-4 text-sm" to="#">Previous</Link></li>
                <li><Link className="inline-flex h-10 items-center rounded-md px-4 text-sm hover:underline" to="#">1</Link></li>
                <li><Link className="inline-flex h-10 items-center rounded-md px-4 text-sm hover:underline" to="#">2</Link></li>
                <li><Link className="inline-flex h-10 items-center gap-1 rounded-md border px-4 text-sm" to="#">Next</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </section>
    </>
  );
};

export default Venues;
