import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FacilityApproval = () => {
  return (
    <div className="container py-10">
      <SEO title="Facility Approval – QuickCourt" description="Approve or reject facility registrations with comments." />
      <PageHeader title="Facility Approval" />
      <Card>
        <CardHeader><CardTitle>Pending facilities</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between"><span>Elite Sports Hub</span><div className="flex gap-2"><Button size="sm" variant="outline">Reject</Button><Button size="sm">Approve</Button></div></div>
          <div className="flex items-center justify-between"><span>City Turf Grounds</span><div className="flex gap-2"><Button size="sm" variant="outline">Reject</Button><Button size="sm">Approve</Button></div></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacilityApproval;
