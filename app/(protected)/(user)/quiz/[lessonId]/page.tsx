import { Container, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import { getUserRole } from "@/lib/auth/server/rbac";
import { getLessonDetailViewModel } from "@/app/(protected)/(user)/lessons/[id]/lessonDetailData";
import QuizList from "./_components/QuizList";

export default async function QuizListPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const role = await getUserRole();
  const viewModel = await getLessonDetailViewModel(lessonId, role);
  
  if (!viewModel) {
    return notFound();
  }

  const { quizzes, quizLoadError, lesson, status, isOwner } = viewModel;

  return (
    <Container size="md" py="xl">
      <div className="flex flex-col gap-6">
        
        <div>
          <Title order={1}>{lesson.title} - Quizzes</Title>
        </div>
        
        <QuizList 
           lessonId={lessonId} 
           quizzes={quizzes} 
           quizLoadError={quizLoadError} 
           role={role}
           status={status}
           isOwner={isOwner}
        />
      </div>
    </Container>
  );
}
