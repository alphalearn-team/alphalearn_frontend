import type { LessonQuiz } from "@/interfaces/interfaces";
import { fetchUserQuizAttempts } from "@/app/(protected)/(user)/quiz/quizData";
import QuizList from "./QuizList";

interface QuizListServerWrapperProps {
  lessonId: string;
  quizzes: LessonQuiz[];
  quizLoadError: string | null;
  isOwner: boolean;
}

export default async function QuizListServerWrapper({
  lessonId,
  quizzes,
  quizLoadError,
  isOwner,
}: QuizListServerWrapperProps) {
  const bestAttempts = await fetchUserQuizAttempts(quizzes);

  return (
    <QuizList
      lessonId={lessonId}
      quizzes={quizzes}
      quizLoadError={quizLoadError}
      isOwner={isOwner}
      bestAttempts={bestAttempts}
    />
  );
}
