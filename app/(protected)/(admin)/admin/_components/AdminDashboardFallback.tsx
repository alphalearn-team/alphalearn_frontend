import CardSkeleton from "@/components/common/CardSkeleton";

export default function AdminDashboardFallback() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="admin-card">
            <CardSkeleton count={1} cols={1} showBookmark={false} lines={2} />
          </div>
        ))}
      </div>

      <div className="admin-card">
        <CardSkeleton count={5} cols={1} showBookmark={false} lines={2} />
      </div>
    </div>
  );
}
