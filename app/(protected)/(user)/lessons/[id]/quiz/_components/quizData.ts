import type { LessonQuiz, QuizAttemptSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";
import { normalizeLessonQuizzes } from "@/lib/utils/lessonQuiz";
import { toFriendlyBestQuizAttemptError } from "@/lib/utils/lessonQuiz";
import { ApiError } from "@/lib/api/apiErrors";

export interface LessonQuizLoadResult {
  error: string | null;
  status: number | null;
  quizzes: LessonQuiz[];
}

export async function fetchLessonQuizzes(
  lessonPublicId: string,
): Promise<LessonQuizLoadResult> {
  try {
    const quizzes = await apiFetch<LessonQuiz[]>(`/quizzes/${lessonPublicId}`);
    return {
      error: null,
      status: 200,
      quizzes: normalizeLessonQuizzes(quizzes),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to load lesson quizzes right now.",
      status: error instanceof ApiError ? error.status : null,
      quizzes: [],
    };
  }
}

export type AttemptRecord = { summary: QuizAttemptSummary | null; error: string | null };

export async function fetchUserQuizAttempts(
  quizzes: LessonQuiz[]
): Promise<Record<string, AttemptRecord>> {
  const bestAttempts: Record<string, AttemptRecord> = {};
  
  if (!quizzes || quizzes.length === 0) {
    return bestAttempts;
  }

  await Promise.all(
    quizzes.map(async (quiz) => {
      const quizId = quiz.quizPublicId;
      try {
        const summary = await apiFetch<QuizAttemptSummary>(`/me/quizzes/${quizId}/attempts/best`);
        bestAttempts[quizId] = { summary, error: null };
      } catch (error) {
        bestAttempts[quizId] = { summary: null, error: toFriendlyBestQuizAttemptError(error) };
      }
    })
  );

  return bestAttempts;
}
