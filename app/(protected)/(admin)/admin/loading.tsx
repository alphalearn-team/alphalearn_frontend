import AdminDashboardFallback from "./_components/AdminDashboardFallback";

export default function AdminDashboardLoadingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminDashboardFallback />
      </div>
    </div>
  );
}
