import type { AdminLessonReviewDetail } from "@/interfaces/interfaces";
import "@mantine/tiptap/styles.css";
import NotFound from "@/components/NotFound";

import { apiFetch } from "@/lib/api/api";
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
  console.log("this is the lesson: ", lesson);

  if (!lesson) {
    return <NotFound/>
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">

        <AdminLessonReviewView lesson={lesson} />
      </div>
    </div>
  );
}
