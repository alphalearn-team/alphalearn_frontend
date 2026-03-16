import AdminPageHeader from "@/components/admin/PageHeader";
import { fetchAdminDashboardSummaryByQueryAction } from "@/lib/actions/adminDashboard";
import AdminDashboardSummaryPanel from "./_components/AdminDashboardSummaryPanel";

export default async function AdminPage() {
  const dashboardSummaryResult = await fetchAdminDashboardSummaryByQueryAction({
    range: "30d",
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeader
          title="Admin Dashboard"
          description="Overview of platform activity and concept performance"
          icon="dashboard"
        />

        <AdminDashboardSummaryPanel
          summary={dashboardSummaryResult.success ? dashboardSummaryResult.data : null}
          error={dashboardSummaryResult.success ? null : dashboardSummaryResult.message}
        />
      </div>
    </div>
  );
}
