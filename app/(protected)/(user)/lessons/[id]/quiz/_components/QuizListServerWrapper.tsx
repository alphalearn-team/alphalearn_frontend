import type { LessonQuiz } from "@/interfaces/interfaces";
import { fetchUserQuizAttempts } from "./quizData";
import QuizList from "./QuizList";

interface QuizListServerWrapperProps {
  lessonId: string;
  quizzes: LessonQuiz[];
  quizLoadError: string | null;
}

export default async function QuizListServerWrapper({
  lessonId,
  quizzes,
  quizLoadError,
}: QuizListServerWrapperProps) {
  const bestAttempts = await fetchUserQuizAttempts(quizzes);

  return (
    <QuizList
      lessonId={lessonId}
      quizzes={quizzes}
      quizLoadError={quizLoadError}
      bestAttempts={bestAttempts}
    />
  );
}
