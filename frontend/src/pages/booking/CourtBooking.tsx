import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useParams } from "react-router-dom";

const CourtBooking = () => {
  const { venueId } = useParams();
  return (
    <div className="container py-10">
      <SEO title="Book Court – QuickCourt" description="Select court, date, and time slot to book your session." />
      <PageHeader title="Book your slot" subtitle={`Venue #${venueId}`} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Choose court and time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Court</label>
                <Select defaultValue="court1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="court1">Court 1</SelectItem>
                    <SelectItem value="court2">Court 2</SelectItem>
                    <SelectItem value="court3">Court 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Date</label>
                <input type="date" className="w-full rounded-md border bg-background px-3 py-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Sport</label>
                <Select defaultValue="badminton">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Select a time slot</label>
              <ToggleGroup type="single" className="flex flex-wrap gap-2">
                {["06:00","07:00","08:00","09:00","17:00","18:00","19:00","20:00"].map(t => (
                  <ToggleGroupItem key={t} value={t} aria-label={`Time ${t}`} className="border">
                    {t}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>
        <aside>
          <Card className="surface-card">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Venue: Premier Sports Arena</div>
              <div>Court: Court 1</div>
              <div>Time: 18:00 - 19:00</div>
              <div className="text-foreground font-medium">Total: ₹349</div>
              <Button className="w-full">Confirm and pay</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CourtBooking;
