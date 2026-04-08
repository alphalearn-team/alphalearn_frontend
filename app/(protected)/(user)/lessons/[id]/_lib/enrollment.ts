"use server";
import { apiFetch } from "@/lib/api/api";

export interface EnrolledLessonSummary {
  lessonPublicId: string;
  title: string;
  completed: boolean;
  firstCompletedAt: string | null;
}

export async function enrollInLesson(lessonId: string): Promise<void> {
  await apiFetch(`/lesson-enrollments/${lessonId}`, {
    method: "POST",
  });
}

export async function getMyEnrollments(): Promise<EnrolledLessonSummary[]> {
  return apiFetch<EnrolledLessonSummary[]>("/me/lesson-enrollments");
}

export async function getEnrollmentStatus(lessonId: string): Promise<{ enrolled: boolean }> {
  return apiFetch<{ enrolled: boolean }>(`/me/lesson-enrollments/${lessonId}`);
}

export interface LessonProgressSummary {
  lessonPublicId: string;
  title: string;
  completed: boolean;
  firstCompletedAt: string | null;
  totalQuizzes: number;
  passedQuizzes: number;
}

export async function getMyProgress(): Promise<LessonProgressSummary[]> {
  try {
    return await apiFetch<LessonProgressSummary[]>("/me/lesson-enrollments?view=PROGRESS");
  } catch {
    try {
      const enrollments = await getMyEnrollments();
      return enrollments.map((lesson) => ({
        lessonPublicId: lesson.lessonPublicId,
        title: lesson.title,
        completed: lesson.completed,
        firstCompletedAt: lesson.firstCompletedAt,
        totalQuizzes: 0,
        passedQuizzes: 0,
      }));
    } catch {
      return [];
    }
  }
}
