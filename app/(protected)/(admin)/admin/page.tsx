import AdminPageHeader from "@/components/admin/PageHeader";

export default async function AdminPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeader
          title="Admin Dashboard"
          description="Welcome to the AlphaLearn admin panel"
          icon="dashboard"
        />

        {/* Dashboard content will go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for dashboard widgets */}
        </div>
      </div>
    </div>
  );
}
