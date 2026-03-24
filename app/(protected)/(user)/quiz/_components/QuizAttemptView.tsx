"use client";

import { useState, useEffect } from "react";
import { Alert, Button, Card, Checkbox, Group, Radio, Stack, Text, Title, Center, Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client/AuthContext";
import type { LessonQuiz, QuizAttemptSummary } from "@/interfaces/interfaces";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";
import { apiClientFetch } from "@/lib/api/apiClient";
import type { UserRole } from "@/lib/auth/server/rbac";
import {
  buildQuizAttemptPayload,
  canSubmitLessonQuiz,
  getLessonQuizSubmissionBlockReason,
  getLessonQuizSubmissionHelperMessage,
  getUnansweredQuizQuestionIds,
  toFriendlyLessonQuizError,
  type LessonQuizAnswers,
} from "@/lib/utils/lessonQuiz";

interface QuizAttemptViewProps {
  lessonId: string;
  quiz: LessonQuiz;
  role: UserRole;
  status: string;
  isOwner: boolean;
}

export default function QuizAttemptView({
  lessonId,
  quiz,
  role,
  status,
  isOwner,
}: QuizAttemptViewProps) {
  const { session } = useAuth();
  const router = useRouter();
  const accessToken = session?.access_token;
  
  const [answers, setAnswers] = useState<LessonQuizAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isStarted, setIsStarted] = useState(false);
  const [bestAttempt, setBestAttempt] = useState<QuizAttemptSummary | null>(null);
  const [isLoadingBest, setIsLoadingBest] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setIsLoadingBest(false);
      return;
    }
    const abortController = new AbortController();
    apiClientFetch<QuizAttemptSummary>(
      `/me/quizzes/${quiz.quizPublicId}/attempts/best`,
      accessToken,
      { signal: abortController.signal }
    )
      .then((summary) => {
        setBestAttempt(summary);
        setIsLoadingBest(false);
      })
      .catch(() => {
        setIsLoadingBest(false);
      });
    return () => abortController.abort();
  }, [accessToken, quiz.quizPublicId]);

  const setSelectedOptionIds = (
    questionPublicId: string,
    selectedOptionIds: string[],
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionPublicId]: selectedOptionIds,
    }));
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    const unansweredQuestionIds = getUnansweredQuizQuestionIds(quiz, answers);
    const allQuestionsAnswered = unansweredQuestionIds.length === 0;

    if (!canSubmitLessonQuiz({
      lessonStatus: status,
      role,
      isOwner,
      hasAccessToken: Boolean(accessToken),
      allQuestionsAnswered,
      isSubmitting,
    })) {
      return;
    }

    if (!accessToken) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClientFetch<QuizAttemptSummary>(
        `/me/quizzes/${quiz.quizPublicId}/attempts`,
        accessToken,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildQuizAttemptPayload(quiz, answers)),
        },
      );

      setIsSubmitting(false);
      showSuccess("Quiz submitted successfully!");
      
      // Redirect back to quiz list page to show results
      router.push(`/quiz/${lessonId}`);
      router.refresh();
      
    } catch (error) {
      const message = toFriendlyLessonQuizError(error);
      setIsSubmitting(false);
      setSubmitError(message);
      showError(message);
    }
  };

  const unansweredQuestionIds = getUnansweredQuizQuestionIds(quiz, answers);
  const unansweredCount = unansweredQuestionIds.length;
  const submissionBlockReason = getLessonQuizSubmissionBlockReason({
    lessonStatus: status,
    role,
    isOwner,
    hasAccessToken: Boolean(accessToken),
    allQuestionsAnswered: unansweredCount === 0,
    isSubmitting,
  });
  
  const helperMessage = getLessonQuizSubmissionHelperMessage(
    submissionBlockReason,
    unansweredCount,
  );
  
  const shouldHideSubmitButton =
    submissionBlockReason === "owner" || submissionBlockReason === "not-approved";

  if (!isStarted) {
    return (
      <div className="space-y-6">
         <div>
           <Title order={2}>Quiz Overview</Title>
           <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
             {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'}
           </Text>
         </div>

         <Card padding="xl" className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md" style={{ borderRadius: "0.75rem" }}>
            {isLoadingBest ? (
               <Center p="xl"><Loader color="var(--color-primary)" /></Center>
            ) : bestAttempt ? (
               <Stack>
                 <div className="rounded-lg bg-[var(--color-primary-light)] p-4 border border-[var(--color-primary)] opacity-90">
                    <Text size="xs" fw={700} className="uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Best Attempt</Text>
                    <Group justify="space-between">
                      <Text fw={600} style={{ color: "var(--color-text)" }}>Score: {bestAttempt.score} / {bestAttempt.totalQuestions}</Text>
                    </Group>
                    <Text size="xs" className="text-[var(--color-text-muted)] mt-1">
                      {new Date(bestAttempt.attemptedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </Text>
                 </div>
                 <Button mt="md" size="md" radius="xl" onClick={() => setIsStarted(true)}>
                   Retake Quiz
                 </Button>
               </Stack>
            ) : (
               <Stack align="center" gap="md" py="lg">
                 <Text size="lg" fw={500} className="text-[var(--color-text)]">Ready to begin?</Text>
                 <Button size="md" radius="xl" onClick={() => setIsStarted(true)}>
                   Start Quiz
                 </Button>
               </Stack>
            )}
         </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
         <Title order={2}>Quiz Attempt</Title>
         <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
           Answer the questions below to complete the quiz.
         </Text>
       </div>

       <Card
          padding="xl"
          className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md"
          style={{ borderRadius: "0.75rem" }}
        >
          <Stack gap="xl">
            {quiz.questions.map((question, questionIndex) => {
               const selectedOptionIds = answers[question.questionPublicId] ?? [];

               return (
                  <div
                    key={question.questionPublicId}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-6"
                  >
                    <div className="mb-5 flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-surface)",
                        }}
                      >
                        {questionIndex + 1}
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        <Text
                          size="xs"
                          fw={700}
                          className="uppercase tracking-[0.15em] text-[var(--color-primary)] opacity-80"
                        >
                          {question.type.replace("-", " ")}
                        </Text>
                        <Text size="lg" fw={500} className="mt-2 text-[var(--color-text)]">
                          {question.prompt}
                        </Text>
                      </div>
                    </div>

                    <div className="pl-14">
                        {question.type === "multiple-choice" ? (
                          <Checkbox.Group
                            value={selectedOptionIds}
                            onChange={(value) =>
                              setSelectedOptionIds(question.questionPublicId, value)
                            }
                          >
                            <Stack gap="sm">
                              {question.options.map((option) => (
                                <Checkbox
                                  key={option.id}
                                  value={option.id}
                                  label={option.text}
                                  size="md"
                                  styles={{
                                    label: { color: "var(--color-text)", cursor: "pointer" },
                                    body: { alignItems: "center" }
                                  }}
                                />
                              ))}
                            </Stack>
                          </Checkbox.Group>
                        ) : (
                          <Radio.Group
                            value={selectedOptionIds[0] ?? ""}
                            onChange={(value) =>
                              setSelectedOptionIds(question.questionPublicId, value ? [value] : [])
                            }
                          >
                            <Stack gap="sm">
                              {question.options.map((option) => (
                                <Radio
                                  key={option.id}
                                  value={option.id}
                                  label={option.text}
                                  size="md"
                                  styles={{
                                    label: { color: "var(--color-text)", cursor: "pointer" },
                                    body: { alignItems: "center" }
                                  }}
                                />
                              ))}
                            </Stack>
                          </Radio.Group>
                        )}
                    </div>
                  </div>
               );
             })}

             {submitError && (
               <Alert color="red" radius="md" title="Submission error">
                 {submitError}
               </Alert>
             )}

             {submissionBlockReason === "incomplete" && helperMessage ? (
               <Alert color="yellow" radius="md" title="Almost there">
                 {helperMessage}
               </Alert>
             ) : null}

             {submissionBlockReason !== "incomplete"
               && submissionBlockReason !== "not-approved"
               && submissionBlockReason !== "owner"
               && submissionBlockReason !== null
               && helperMessage ? (
               <Alert color="blue" radius="md" title="Notice">
                 {helperMessage}
               </Alert>
             ) : null}

             {!shouldHideSubmitButton && (
               <Group justify="flex-end" mt="md">
                 <Button
                   radius="xl"
                   size="md"
                   onClick={handleSubmit}
                   loading={isSubmitting}
                   disabled={submissionBlockReason !== null}
                   className="w-full sm:w-auto"
                 >
                   Submit Quiz
                 </Button>
               </Group>
             )}
          </Stack>
       </Card>
    </div>
  );
}
