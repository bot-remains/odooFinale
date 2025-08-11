import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const data = [
  { name: "Mon", bookings: 12 },
  { name: "Tue", bookings: 18 },
  { name: "Wed", bookings: 9 },
  { name: "Thu", bookings: 22 },
  { name: "Fri", bookings: 28 },
  { name: "Sat", bookings: 35 },
  { name: "Sun", bookings: 20 },
];

const OwnerDashboard = () => {
  return (
    <div className="container py-10">
      <SEO title="Owner Dashboard – QuickCourt" description="KPIs and charts for your facility performance." />
      <PageHeader title="Dashboard" subtitle="Welcome back!" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Weekly Booking Trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ bookings: { label: "Bookings", color: "hsl(var(--primary))" } }}>
              <BarChart data={data}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>KPIs</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Total bookings: 124</div>
            <div>Active courts: 6</div>
            <div>Earnings (sim): ₹42,500</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
