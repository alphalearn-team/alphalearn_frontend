"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Group, Stack, Text, Badge } from "@mantine/core";
import Link from "next/link";
import { useAuth } from "@/lib/auth/client/AuthContext";
import type { LessonQuiz, QuizAttemptSummary } from "@/interfaces/interfaces";
import { apiClientFetch } from "@/lib/api/apiClient";
import type { UserRole } from "@/lib/auth/server/rbac";
import { formatDateTime } from "@/lib/utils/formatDate";
import { toFriendlyBestQuizAttemptError, toFriendlyLatestQuizAttemptError } from "@/lib/utils/lessonQuiz";

interface QuizListProps {
  lessonId: string;
  quizzes: LessonQuiz[];
  quizLoadError: string | null;
  role: UserRole;
  status: string;
  isOwner: boolean;
}

interface AttemptRecord {
  summary: QuizAttemptSummary | null;
  error: string | null;
  isLoading: boolean;
}

function formatAttemptedAtForLocale(date: string): string {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function QuizList({
  lessonId,
  quizzes,
  quizLoadError,
  role,
}: QuizListProps) {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  
  const [latestAttempts, setLatestAttempts] = useState<Record<string, AttemptRecord>>({});
  const [bestAttempts, setBestAttempts] = useState<Record<string, AttemptRecord>>({});

  const supportsQuizAttempts = role === "LEARNER" || role === "CONTRIBUTOR";

  useEffect(() => {
    if (!accessToken || !supportsQuizAttempts || quizzes.length === 0) {
      return;
    }

    const abortController = new AbortController();

    // Initialize loading state
    const initLatest: Record<string, AttemptRecord> = {};
    const initBest: Record<string, AttemptRecord> = {};
    quizzes.forEach(q => {
      initLatest[q.quizPublicId] = { summary: null, error: null, isLoading: true };
      initBest[q.quizPublicId] = { summary: null, error: null, isLoading: true };
    });
    setLatestAttempts(initLatest);
    setBestAttempts(initBest);

    void Promise.all(
      quizzes.map(async (quiz) => {
        const quizId = quiz.quizPublicId;
        
        // Fetch Latest
        apiClientFetch<QuizAttemptSummary>(
          `/me/quizzes/${quizId}/attempts/latest`,
          accessToken,
          { signal: abortController.signal },
        )
          .then((summary) => {
            setLatestAttempts(prev => ({
              ...prev,
              [quizId]: { summary, error: null, isLoading: false }
            }));
          })
          .catch((error) => {
             setLatestAttempts(prev => ({
              ...prev,
              [quizId]: { summary: null, error: toFriendlyLatestQuizAttemptError(error), isLoading: false }
            }));
          });

        // Fetch Best
        apiClientFetch<QuizAttemptSummary>(
          `/me/quizzes/${quizId}/attempts/best`,
          accessToken,
          { signal: abortController.signal },
        )
           .then((summary) => {
            setBestAttempts(prev => ({
              ...prev,
              [quizId]: { summary, error: null, isLoading: false }
            }));
          })
          .catch((error) => {
             setBestAttempts(prev => ({
              ...prev,
              [quizId]: { summary: null, error: toFriendlyBestQuizAttemptError(error), isLoading: false }
            }));
          });
      })
    );

    return () => {
      abortController.abort();
    };
  }, [accessToken, supportsQuizAttempts, quizzes]);

  if (quizLoadError) {
    return (
      <Alert color="red" radius="md" title="Error loading quizzes">
        {quizLoadError}
      </Alert>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Alert color="blue" radius="md" title="No quizzes available">
        There are currently no quizzes associated with this lesson.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {quizzes.map((quiz, idx) => {
        const latest = latestAttempts[quiz.quizPublicId];
        const best = bestAttempts[quiz.quizPublicId];
        const hasAttempted = best?.summary || latest?.summary;
        const totalQuestions = quiz.questions?.length || 0;

        return (
          <Card
            key={quiz.quizPublicId}
            padding="xl"
            className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
            style={{ borderRadius: "0.75rem" }}
          >
            <Stack gap="lg">
              <Group justify="space-between" align="start">
                 <div>
                   <Text size="lg" fw={600} style={{ color: "var(--color-text)" }}>
                     Quiz {idx + 1}
                   </Text>
                   <Text size="sm" mt={2} className="text-[var(--color-text-muted)]">
                     {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'} • Added {formatDateTime(quiz.createdAt)}
                   </Text>
                 </div>
                 {hasAttempted && (
                   <Badge color="green" radius="sm">Attempted</Badge>
                 )}
              </Group>

              {(latest?.summary || best?.summary) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {latest?.summary && (
                     <div className="rounded-lg bg-[var(--color-background)] p-4 border border-[var(--color-border)]">
                        <Text size="xs" fw={700} className="uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Last Attempt</Text>
                        <Group justify="space-between">
                          <Text fw={600} style={{ color: "var(--color-text)" }}>Score: {latest.summary.score} / {latest.summary.totalQuestions}</Text>
                        </Group>
                        <Text size="xs" className="text-[var(--color-text-muted)] mt-1">
                          {formatAttemptedAtForLocale(latest.summary.attemptedAt)}
                        </Text>
                     </div>
                  )}
                  {best?.summary && (
                     <div className="rounded-lg bg-[var(--color-primary-light)] p-4 border border-[var(--color-primary)] opacity-90">
                        <Text size="xs" fw={700} className="uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Best Attempt</Text>
                        <Group justify="space-between">
                          <Text fw={600} style={{ color: "var(--color-text)" }}>Score: {best.summary.score} / {best.summary.totalQuestions}</Text>
                        </Group>
                        <Text size="xs" className="text-[var(--color-text-muted)] mt-1">
                          {formatAttemptedAtForLocale(best.summary.attemptedAt)}
                        </Text>
                     </div>
                  )}
                </div>
              )}

              {/* Error displaying attempts if any */}
              {latest?.error && !latest?.summary && (
                  <Alert color="yellow" title="Could not load latest attempt">{latest.error}</Alert>
              )}
              {best?.error && !best?.summary && (
                  <Alert color="yellow" title="Could not load best attempt">{best.error}</Alert>
              )}

              <Group justify="flex-end" mt="md">
                <Button
                  component={Link}
                  href={`/quiz/${lessonId}/${quiz.quizPublicId}`}
                  radius="xl"
                  color="var(--color-primary)"
                >
                  {hasAttempted ? "Retake Quiz" : "Attempt Quiz"}
                </Button>
              </Group>
            </Stack>
          </Card>
        );
      })}
    </div>
  );
}
