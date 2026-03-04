import { apiFetch } from "@/lib/api";
import { Card } from "@mantine/core";
import { Suspense } from "react";
import CardSkeleton from "@/components/common/cardSkeleton";
import LessonsManagementTable from "./lessonsTable";
import AdminBreadcrumb from "@/components/admin/breadcrumb";
import AdminPageHeader from "@/components/admin/pageHeader";
import type { AdminLessonQueueItem } from "@/interfaces/interfaces";
import { getUserRole } from "@/lib/auth/rbac";

async function LessonsData() {
  const role = await getUserRole();
  if (role !== "ADMIN") return null;

  const lessons = await apiFetch<AdminLessonQueueItem[]>("/admin/lessons?status=PENDING");

  return <LessonsManagementTable lessons={lessons} />;
}

export default function ManageLessonsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminBreadcrumb />

        <AdminPageHeader
          title="Lesson Review Queue"
          description="Review lessons pending manual moderation"
          icon="rate_review"
        />

        <Suspense
          fallback={
            <Card className="admin-card">
              <CardSkeleton count={6} cols={1} showBookmark={false} lines={2} />
            </Card>
          }
        >
          <LessonsData />
        </Suspense>
      </div>
    </div>
  );
}
