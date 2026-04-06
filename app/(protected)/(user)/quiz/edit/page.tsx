import { apiFetch } from "@/lib/api/api";
import type { LessonQuiz, LessonQuizQuestion } from "@/interfaces/interfaces";
import type { Question, MCQOption } from "@/app/(protected)/(user)/quiz/_components/quizbuilder/types";
import QuizBuilder from "@/app/(protected)/(user)/quiz/_components/quizbuilder/QuizBuilder";

function mapToBuilderQuestions(apiQuestions: LessonQuizQuestion[]): Question[] {
  return apiQuestions.map((q) => {
    const uid = q.questionPublicId;

    if (q.type === "true-false") {
      return {
        uid,
        type: "true-false" as const,
        prompt: q.prompt,
        correctBoolean: q.correctAnswerIds[0] === "true",
      };
    }

    const options: MCQOption[] = q.options.map((o) => ({ id: o.id, text: o.text }));

    if (q.type === "multiple-choice") {
      return {
        uid,
        type: "multiple-choice" as const,
        prompt: q.prompt,
        options,
        correctOptionIds: q.correctAnswerIds,
      };
    }

    return {
      uid,
      type: "single-choice" as const,
      prompt: q.prompt,
      options,
      correctOptionId: q.correctAnswerIds[0] ?? options[0]?.id ?? "",
    };
  });
}

export default async function QuizEditPage({
  searchParams,
}: {
  searchParams: Promise<{ quizId?: string; lessonId?: string }>;
}) {
  const { quizId, lessonId } = await searchParams;

  if (!quizId || !lessonId) {
    return <QuizBuilder />;
  }

  try {
    const quizzes = await apiFetch<LessonQuiz[]>(`/quizzes/${lessonId}`);
    const quiz = quizzes.find((q) => q.quizPublicId === quizId);

    if (!quiz) {
      return <QuizBuilder />;
    }

    const initialQuestions = mapToBuilderQuestions(quiz.questions);

    return (
      <QuizBuilder
        initialQuestions={initialQuestions}
        quizPublicId={quizId}
        lessonPublicId={lessonId}
      />
    );
  } catch {
    return <QuizBuilder />;
  }
}
