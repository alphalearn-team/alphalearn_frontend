import { Container } from "@mantine/core";
import { notFound } from "next/navigation";
import { getUserRole } from "@/lib/auth/server/rbac";
import { fetchLessonQuizzes, checkIsOwnerFromQuizzes } from "@/app/(protected)/(user)/quiz/quizData";
import QuizAttemptView from "@/app/(protected)/(user)/quiz/_components/quizviewer/QuizAttemptView";

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ lessonId: string; quizId: string }>;
}) {
  const { lessonId, quizId } = await params;
  const role = await getUserRole();
  const { quizzes } = await fetchLessonQuizzes(lessonId);
  const isOwner = await checkIsOwnerFromQuizzes(quizzes);
  
  const activeQuiz = quizzes.find((q) => q.quizPublicId === quizId);
  if (!activeQuiz) {
    return notFound();
  }

  return (
    <Container size="md" py="xl">
      <div className="flex flex-col gap-6">
        
        <QuizAttemptView 
           lessonId={lessonId} 
           quiz={activeQuiz} 
           role={role}
           status="APPROVED"
           isOwner={isOwner}
        />
      </div>
    </Container>
  );
}
