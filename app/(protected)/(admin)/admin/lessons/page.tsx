import { Suspense } from "react";
import AdminPageHeader from "@/app/(protected)/(admin)/admin/_components/PageHeader";

import LessonsManagementTable from "./_components/LessonsManagementTable";
import LessonsManagementFallback from "./_components/LessonsManagementFallback";
import { fetchPendingAdminLessons } from "./lessonsQueueData";

async function LessonsData() {
  const lessons = await fetchPendingAdminLessons();
  return <LessonsManagementTable lessons={lessons} />;
}

export default function ManageLessonsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <AdminPageHeader
          title="Lesson Review Queue"
          description="Review lessons pending manual moderation"
          icon="rate_review"
        />

        <Suspense fallback={<LessonsManagementFallback />}>
          <LessonsData />
        </Suspense>
      </div>
    </div>
  );
}
