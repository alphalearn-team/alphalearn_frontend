"use server";
import { apiFetch } from "@/lib/api/api";

export interface EnrolledLessonSummary {
  lessonPublicId: string;
  title: string;
  completed: boolean;
  firstCompletedAt: string | null;
}

export async function enrollInLesson(lessonId: string): Promise<void> {
  await apiFetch(`/lessonenrollments/${lessonId}`, {
    method: "POST",
  });
}

export async function getMyEnrollments(): Promise<EnrolledLessonSummary[]> {
  return apiFetch<EnrolledLessonSummary[]>("/lessonenrollments/me");
}

export async function getEnrollmentStatus(lessonId: string): Promise<{ enrolled: boolean }> {
  return apiFetch<{ enrolled: boolean }>(`/lessonenrollments/me/${lessonId}`);
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
  return apiFetch<LessonProgressSummary[]>("/lessonenrollments/me/progress");
}
