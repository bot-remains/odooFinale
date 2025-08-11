import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BookingOverview = () => {
  return (
    <div className="container py-10">
      <SEO title="Booking Overview – QuickCourt" description="View upcoming and past bookings for your facility." />
      <PageHeader title="Booking Overview" />
      <Card>
        <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>• Jane Doe – Court 1 – 2025-08-12 – 18:00</div>
          <div>• John Smith – Turf A – 2025-08-13 – 07:00</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingOverview;
