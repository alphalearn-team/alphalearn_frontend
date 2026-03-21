import { Suspense } from "react";
import AdminPageHeader from "@/app/(protected)/(admin)/admin/_components/PageHeader";
import UsersManagementTable from "./_components/UsersManagementTable";
import UsersManagementFallback from "./_components/UsersManagementFallback";
import { fetchAdminUsers } from "./contributorsData";

async function UsersData() {
  const users = await fetchAdminUsers();
  return <UsersManagementTable users={users} />;
}

export default function ManageUsersPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <AdminPageHeader
          title="Manage Users"
          description="View and manage all contributors and learners"
          icon="group"
        />

        <Suspense fallback={<UsersManagementFallback />}>
          <UsersData />
        </Suspense>
      </div>
    </div>
  );
}
