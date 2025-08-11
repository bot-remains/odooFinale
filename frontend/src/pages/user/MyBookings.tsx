import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MyBookings = () => {
  const items = [
    { id: 1, venue: "Smash & Serve Arena", sport: "Badminton", court: "Court 2", date: "2025-08-12", time: "18:00-19:00", status: "Confirmed" },
    { id: 2, venue: "City Turf Grounds", sport: "Football", court: "Turf A", date: "2025-08-15", time: "07:00-08:00", status: "Completed" },
  ];

  return (
    <div className="container py-10">
      <SEO title="My Bookings – QuickCourt" description="Review your current and past court bookings." />
      <PageHeader title="My Bookings" />
      <div className="grid gap-4">
        {items.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle className="text-lg">{b.venue}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>Sport: {b.sport} • Court: {b.court}</div>
              <div>Date: {b.date} • Time: {b.time}</div>
              <div>Status: <Badge variant="secondary">{b.status}</Badge></div>
              {b.status === "Confirmed" && <Button size="sm" variant="outline">Cancel</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
