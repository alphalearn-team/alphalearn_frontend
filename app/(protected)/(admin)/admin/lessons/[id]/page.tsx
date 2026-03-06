import type { AdminLessonReviewDetail } from "@/interfaces/interfaces";
import "@mantine/tiptap/styles.css";
import { notFound } from "next/navigation";
import AdminBreadcrumb from "@/components/admin/Breadcrumb";
import { apiFetch } from "@/lib/api";
import AdminLessonReviewView from "./_components/AdminLessonReviewView";

async function getAdminLessonDetail(
  lessonPublicId: string,
): Promise<AdminLessonReviewDetail | null> {
  try {
    return await apiFetch<AdminLessonReviewDetail>(`/admin/lessons/${lessonPublicId}`);
  } catch {
    return null;
  }
}

export default async function AdminLessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getAdminLessonDetail(id);

  if (!lesson) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <AdminBreadcrumb />
        <AdminLessonReviewView lesson={lesson} />
      </div>
    </div>
  );
}
