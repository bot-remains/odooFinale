import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { name: "Jan", bookings: 120, users: 45 },
  { name: "Feb", bookings: 150, users: 62 },
  { name: "Mar", bookings: 180, users: 70 },
  { name: "Apr", bookings: 210, users: 85 },
];

const AdminDashboard = () => {
  return (
    <div className="container py-10">
      <SEO title="Admin Dashboard – QuickCourt" description="Platform-wide KPIs and trends." />
      <PageHeader title="Admin Dashboard" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Booking Activity Over Time</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ bookings: { label: "Bookings", color: "hsl(var(--primary))" }, users: { label: "New Users", color: "hsl(var(--accent))" } }}>
              <LineChart data={data}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>KPIs</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Total users: 3,420</div>
            <div>Total facility owners: 120</div>
            <div>Total bookings: 18,540</div>
            <div>Total active courts: 430</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
