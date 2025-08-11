import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";

const ReportsModeration = () => {
  return (
    <div className="container py-10">
      <SEO title="Reports & Moderation – QuickCourt" description="View reports submitted by users and take actions." />
      <PageHeader title="Reports & Moderation" />
      <p className="text-sm text-muted-foreground">No reports at the moment.</p>
    </div>
  );
};

export default ReportsModeration;
