import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserProfile = () => {
  return (
    <div className="container py-10">
      <SEO title="My Profile – QuickCourt" description="View and update your QuickCourt profile details." />
      <PageHeader title="My Profile" />
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Name: Jane Doe</p>
              <p>Email: jane@example.com</p>
              <Button variant="outline">Edit info</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bookings">
          <p className="text-sm text-muted-foreground">Use the My Bookings page for full details.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
