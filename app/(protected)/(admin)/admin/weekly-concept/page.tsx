import AdminBreadcrumb from "@/components/admin/Breadcrumb";
import AdminPageHeader from "@/components/admin/PageHeader";
import WeeklyConceptSection from "./_components/WeeklyConceptSection";

export default function WeeklyConceptPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminBreadcrumb />

        <AdminPageHeader
          title="Weekly Concept"
          description="Assign one concept per week."
          icon="date_range"
        />

        <WeeklyConceptSection />
      </div>
    </div>
  );
}
