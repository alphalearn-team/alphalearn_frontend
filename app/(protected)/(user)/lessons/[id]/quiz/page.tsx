import { Suspense } from "react";
import { Container, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import NotFound from "@/components/NotFound";
import { fetchLessonQuizzes } from "./_components/quizData";
import QuizListServerWrapper from "./_components/QuizListServerWrapper";
import QuizListSkeleton from "./_components/QuizListSkeleton";
import ContributorNavPanel from "@/app/(protected)/(user)/lessons/[id]/edit/_components/ContributorNavPanel";

export default async function QuizListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { quizzes, error: quizLoadError, status } = await fetchLessonQuizzes(id);

  if (status === 403) {
    redirect(`/lessons/${id}`);
  }

  if (quizzes.length === 0 && quizLoadError) {
    return <NotFound />;
  }

  const lessonTitle = quizzes.length > 0 ? quizzes[0].lessonTitle : "Lesson";
  const isOwner = quizzes.some(q => !q.canAttempt);

  return (
    <>
    {isOwner && <ContributorNavPanel lessonId={id} quizzes={quizzes} />}
    <Container size="md" py="xl">
      <div className="flex flex-col gap-6">
        <div>
          <Title order={1}>{lessonTitle} - Quizzes</Title>
        </div>
        <Suspense fallback={<QuizListSkeleton quizzesCount={quizzes.length || 3} />}>
          <QuizListServerWrapper
            lessonId={id}
            quizzes={quizzes}
            quizLoadError={quizLoadError}
          />
        </Suspense>
      </div>
    </Container>
    </>
  );
}
