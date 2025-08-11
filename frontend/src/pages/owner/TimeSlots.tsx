import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TimeSlots = () => {
  return (
    <div className="container py-10">
      <SEO title="Time Slot Management – QuickCourt" description="Set availability and block slots for maintenance." />
      <PageHeader title="Time Slot Management" />
      <Card>
        <CardHeader><CardTitle>Set availability</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Choose a court and mark available or blocked slots.</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[...Array(16)].map((_, i) => (
              <button key={i} className="rounded-md border px-2 py-1 hover:bg-accent">{6 + Math.floor(i/2)}:{i%2?"30":"00"}</button>
            ))}
          </div>
          <Button>Save availability</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSlots;
