import { Suspense } from "react";
import AdminPageHeader from "@/app/(protected)/(admin)/admin/_components/PageHeader";

import LessonsManagementTable from "./_components/LessonsManagementTable";
import LessonsManagementFallback from "./_components/LessonsManagementFallback";
import LessonsQueueTabs, { type LessonsQueueTab } from "./_components/LessonsQueueTabs";
import ReportedLessonsManagementTable from "./_components/ReportedLessonsManagementTable";
import { fetchPendingAdminLessons } from "./lessonsQueueData";
import { fetchReportedAdminLessons } from "./reportedLessonsData";

async function PendingLessonsData() {
  const lessons = await fetchPendingAdminLessons();
  return <LessonsManagementTable lessons={lessons} />;
}

async function ReportedLessonsData() {
  const lessons = await fetchReportedAdminLessons();
  return <ReportedLessonsManagementTable lessons={lessons} />;
}

function resolveTab(tab: string | null | undefined): LessonsQueueTab {
  return tab === "reported" ? "reported" : "pending";
}

export default async function ManageLessonsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  return <ManageLessonsPageContent searchParams={searchParams} />;
}

async function ManageLessonsPageContent({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab = resolveTab(resolvedSearchParams?.tab);

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <AdminPageHeader
          title={activeTab === "reported" ? "Reported Lessons Queue" : "Lesson Review Queue"}
          description={
            activeTab === "reported"
              ? "Review learner reports and resolve lesson report cases"
              : "Review lessons pending manual moderation"
          }
          icon="rate_review"
        />

        <LessonsQueueTabs activeTab={activeTab} />

        <Suspense fallback={<LessonsManagementFallback />}>
          {activeTab === "reported" ? <ReportedLessonsData /> : <PendingLessonsData />}
        </Suspense>
      </div>
    </div>
  );
}
