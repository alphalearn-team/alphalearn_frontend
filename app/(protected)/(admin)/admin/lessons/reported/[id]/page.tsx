import NotFound from "@/components/NotFound";
import type { AdminLessonReviewDetail, LessonQuiz } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";
import { fetchAdminReportedLessonDetail } from "@/app/(protected)/(admin)/admin/lessons/reportedLessonsData";
import ReportedLessonDetailView from "./_components/ReportedLessonDetailView";

async function fetchLessonPreview(lessonPublicId: string): Promise<AdminLessonReviewDetail | null> {
  try {
    return await apiFetch<AdminLessonReviewDetail>(`/admin/lessons/${lessonPublicId}`);
  } catch {
    return null;
  }
}

async function fetchLessonQuizzesForAdminPreview(lessonPublicId: string): Promise<LessonQuiz[]> {
  try {
    return await apiFetch<LessonQuiz[]>(`/quizzes/${lessonPublicId}`);
  } catch {
    return [];
  }
}

export default async function AdminReportedLessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lesson, lessonPreview, quizzes] = await Promise.all([
    fetchAdminReportedLessonDetail(id),
    fetchLessonPreview(id),
    fetchLessonQuizzesForAdminPreview(id),
  ]);

  if (!lesson) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ReportedLessonDetailView lesson={lesson} lessonPreview={lessonPreview} quizzes={quizzes} />
      </div>
    </div>
  );
}
