
import AdminPageHeader from "@/components/admin/PageHeader";
import { fetchPendingContributorApplicationsAction } from "./actions";
import ContributorApplicationsModerationPanel from "./_components/ContributorApplicationsModerationPanel";

export default async function AdminContributorApplicationsPage() {
  const pendingResult = await fetchPendingContributorApplicationsAction();

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <AdminPageHeader
          title="Contributor Applications"
          description="Review pending contributor applications and approve or reject submissions."
          icon="approval_delegation"
        />

        <ContributorApplicationsModerationPanel
          initialPending={pendingResult.success ? pendingResult.data : []}
          initialError={pendingResult.success ? null : pendingResult.message}
        />
      </div>
    </div>
  );
}
