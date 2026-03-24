import type {
  LessonQuiz,
  LessonQuizQuestion,
  QuizAttemptSummary,
  SubmitQuizAttemptRequest,
} from "@/interfaces/interfaces";
import { ApiError } from "@/lib/api/apiErrors";
import type { UserRole } from "@/lib/auth/server/rbac";

export type LessonQuizAnswers = Record<string, string[]>;

export type LessonQuizSubmissionBlockReason =
  | "not-approved"
  | "owner"
  | "unsupported-user"
  | "unauthenticated"
  | "submitting"
  | "incomplete";

export interface LessonQuizSubmissionEligibilityInput {
  lessonStatus: string;
  role: UserRole | null;
  isOwner: boolean;
  hasAccessToken: boolean;
  allQuestionsAnswered: boolean;
  isSubmitting: boolean;
}

function normalizeQuestion(question: LessonQuizQuestion): LessonQuizQuestion {
  return {
    ...question,
    options: Array.isArray(question.options) ? question.options : [],
    correctAnswerIds: Array.isArray(question.correctAnswerIds) ? question.correctAnswerIds : [],
  };
}

function isQuizEligibleRole(role: UserRole | null): boolean {
  return role === "LEARNER" || role === "CONTRIBUTOR";
}

export function normalizeLessonQuizzes(
  quizzes: LessonQuiz[] | null | undefined,
): LessonQuiz[] {
  if (!Array.isArray(quizzes)) {
    return [];
  }

  return quizzes.map((quiz) => ({
    ...quiz,
    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map(normalizeQuestion)
      : [],
  }));
}

export function getUnansweredQuizQuestionIds(
  quiz: LessonQuiz,
  answers: LessonQuizAnswers,
): string[] {
  return quiz.questions
    .filter((question) => {
      const selectedOptionIds = answers[question.questionPublicId] ?? [];
      return selectedOptionIds.length === 0;
    })
    .map((question) => question.questionPublicId);
}

export function buildQuizAttemptPayload(
  quiz: LessonQuiz,
  answers: LessonQuizAnswers,
): SubmitQuizAttemptRequest {
  return {
    answers: quiz.questions.map((question) => ({
      questionPublicId: question.questionPublicId,
      selectedOptionIds: answers[question.questionPublicId] ?? [],
    })),
  };
}

export function getLessonQuizSubmissionBlockReason({
  lessonStatus,
  role,
  isOwner,
  hasAccessToken,
  allQuestionsAnswered,
  isSubmitting,
}: LessonQuizSubmissionEligibilityInput): LessonQuizSubmissionBlockReason | null {
  if (lessonStatus !== "APPROVED") {
    return "not-approved";
  }

  if (isOwner) {
    return "owner";
  }

  if (!isQuizEligibleRole(role)) {
    return "unsupported-user";
  }

  if (!hasAccessToken) {
    return "unauthenticated";
  }

  if (isSubmitting) {
    return "submitting";
  }

  if (!allQuestionsAnswered) {
    return "incomplete";
  }

  return null;
}

export function canSubmitLessonQuiz(
  input: LessonQuizSubmissionEligibilityInput,
): boolean {
  return getLessonQuizSubmissionBlockReason(input) === null;
}

export function getLessonQuizSubmissionHelperMessage(
  reason: LessonQuizSubmissionBlockReason | null,
  unansweredCount = 0,
): string | null {
  if (reason === "not-approved") {
    return "Quiz submission becomes available after this lesson is approved.";
  }

  if (reason === "owner") {
    return "Lesson creators cannot answer their own quiz.";
  }

  if (reason === "unsupported-user") {
    return "Your account cannot submit quiz attempts.";
  }

  if (reason === "unauthenticated") {
    return "Your session is still loading. Please try again in a moment.";
  }

  if (reason === "submitting") {
    return "Submitting your quiz attempt.";
  }

  if (reason === "incomplete") {
    return unansweredCount === 1
      ? "Answer the remaining question to submit this quiz."
      : `Answer the remaining ${unansweredCount} questions to submit this quiz.`;
  }

  return null;
}

export function getQuizAttemptSummaryMessage(
  summary: QuizAttemptSummary,
): string {
  return summary.isFirstAttempt
    ? "First attempt recorded."
    : "Attempt recorded.";
}

export function toFriendlyLatestQuizAttemptError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return null;
    }

    if (error.status === 403) {
      return error.message || "You are not allowed to access previous quiz attempts.";
    }

    if (error.status >= 500) {
      return "We couldn't load your latest quiz attempt right now.";
    }

    return error.message || "We couldn't load your latest quiz attempt.";
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return null;
    }

    return error.message || "We couldn't load your latest quiz attempt.";
  }

  return "We couldn't load your latest quiz attempt.";
}

export function toFriendlyBestQuizAttemptError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return null;
    }

    if (error.status === 403) {
      return error.message || "You are not allowed to access previous quiz attempts.";
    }

    if (error.status >= 500) {
      return "We couldn't load your best quiz attempt right now.";
    }

    return error.message || "We couldn't load your best quiz attempt.";
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return null;
    }

    return error.message || "We couldn't load your best quiz attempt.";
  }

  return "We couldn't load your best quiz attempt.";
}

export function toFriendlyLessonQuizError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return error.message || "Review your answers and try again.";
    }

    if (error.status === 403) {
      return error.message || "You are not allowed to submit this quiz.";
    }

    if (error.status === 404) {
      return "This quiz is no longer available.";
    }

    if (error.status === 409) {
      return error.message || "This quiz cannot be submitted right now.";
    }

    if (error.status >= 500) {
      return "The server could not process your quiz attempt. Please try again.";
    }

    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong while submitting this quiz.";
}
