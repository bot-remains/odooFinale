import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const FacilityManagement = () => {
  return (
    <div className="container py-10">
      <SEO title="Facility Management – QuickCourt" description="Add or edit your facility and manage courts." />
      <PageHeader title="Facility Management" />
      <Card>
        <CardHeader><CardTitle>Facility details</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2"><Label>Name</Label><Input placeholder="Arena name" /></div>
          <div className="grid gap-2"><Label>Location</Label><Input placeholder="City, Area" /></div>
          <div className="sm:col-span-2 grid gap-2"><Label>Description</Label><Textarea placeholder="Describe your facility" /></div>
          <div className="grid gap-2"><Label>Types of sports</Label><Input placeholder="Badminton, Tennis" /></div>
          <div className="grid gap-2"><Label>Amenities</Label><Input placeholder="Parking, Water, ..." /></div>
          <div className="sm:col-span-2"><Button>Save facility</Button></div>
        </CardContent>
      </Card>
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Add a court</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Court name</Label><Input placeholder="Court 1" /></div>
            <div className="grid gap-2"><Label>Sport type</Label><Input placeholder="Badminton" /></div>
            <div className="grid gap-2"><Label>Price/hour (₹)</Label><Input type="number" placeholder="349" /></div>
            <div className="grid gap-2"><Label>Operating hours</Label><Input placeholder="06:00 - 22:00" /></div>
            <div className="sm:col-span-2"><Button>Add court</Button></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Existing courts</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>• Court 1 – Badminton – ₹349/hr</div>
            <div>• Court 2 – Badminton – ₹299/hr</div>
            <div>• Turf A – Football – ₹499/hr</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacilityManagement;
