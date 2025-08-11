import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const UserManagement = () => {
  return (
    <div className="container py-10">
      <SEO title="User Management – QuickCourt" description="Search, filter, and manage users and facility owners." />
      <PageHeader title="User Management" />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="space-y-2">
          <Input placeholder="Search by name or email" />
        </aside>
        <Card>
          <CardHeader><CardTitle>Users</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>• Jane Doe – User – Active</div>
            <div>• John Smith – Owner – Active</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
