import { Container } from "@mantine/core";
import { notFound } from "next/navigation";
import { getUserRole } from "@/lib/auth/server/rbac";
import { getLessonDetailViewModel } from "@/app/(protected)/(user)/lessons/[id]/lessonDetailData";
import QuizAttemptView from "@/app/(protected)/(user)/quiz/_components/QuizAttemptView";

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ lessonId: string; quizId: string }>;
}) {
  const { lessonId, quizId } = await params;
  const role = await getUserRole();
  const viewModel = await getLessonDetailViewModel(lessonId, role);
  
  if (!viewModel) {
    return notFound();
  }

  const { quizzes, lesson, status, isOwner } = viewModel;
  
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
           status={status}
           isOwner={isOwner}
        />
      </div>
    </Container>
  );
}
