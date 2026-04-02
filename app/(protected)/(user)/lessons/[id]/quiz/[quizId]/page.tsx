import { Container } from "@mantine/core";
import NotFound from "@/components/NotFound";
import { getUserRole } from "@/lib/auth/server/rbac";
import { fetchLessonQuizzes } from "../_components/quizData";
import QuizAttemptView from "../_components/quizviewer/QuizAttemptView";

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = await params;
  const role = await getUserRole();
  const { quizzes } = await fetchLessonQuizzes(id);

  const activeQuiz = quizzes.find((q) => q.quizPublicId === quizId);
  if (!activeQuiz) {
    return <NotFound />;
  }

  return (
    <Container size="md" py="xl">
      <div className="flex flex-col gap-6">
        <QuizAttemptView
          lessonId={id}
          quiz={activeQuiz}
          role={role}
          status="APPROVED"
        />
      </div>
    </Container>
  );
}
