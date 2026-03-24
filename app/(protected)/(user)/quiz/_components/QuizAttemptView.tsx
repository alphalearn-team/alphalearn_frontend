"use client";

import { useState, useEffect } from "react";
import { Alert, Card, Checkbox, Group, Radio, Stack, Text, Title, Center, Loader, Modal, Badge } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client/AuthContext";
import type { LessonQuiz, QuizAttemptSummary } from "@/interfaces/interfaces";
import { formatDateTime } from "@/lib/utils/formatDate";
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
  const [submittedResult, setSubmittedResult] = useState<QuizAttemptSummary | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

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

  const hasAtLeastOneAnswer = Object.keys(answers).length > 0;

  // Handle browser refresh / close tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted && !submittedResult && hasAtLeastOneAnswer) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isStarted, submittedResult, hasAtLeastOneAnswer]);

  // Handle browser back button
  useEffect(() => {
    if (!isStarted || submittedResult || !hasAtLeastOneAnswer) return;

    // Push dummy state to capture next popstate
    window.history.pushState({ noExit: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // If we see our dummy state, don't show modal
      if (e.state?.noExit) return;

      e.preventDefault();
      // Push it back again to keep them on page while modal is open
      window.history.pushState({ noExit: true }, "");
      setShowExitModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isStarted, submittedResult, hasAtLeastOneAnswer]);

  const handleConfirmExit = () => {
    setShowExitModal(false);
    // Move back for real
    window.history.back();
    // Then once more to actually leave (since we pushed two states)
    setTimeout(() => window.history.back(), 50);
  };

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

      const result = await apiClientFetch<QuizAttemptSummary>(
        `/me/quizzes/${quiz.quizPublicId}/attempts/best`,
        accessToken
      );
      setSubmittedResult(result);
      setBestAttempt(result);
      setIsStarted(false);

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

  // Score Screen / Results State
  if (submittedResult) {
    const percentage = Math.round((submittedResult.score / submittedResult.totalQuestions) * 100);

    return (
      <div className="space-y-6">
        <div>
          <Title order={2}>Quiz Results</Title>
          <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
            Here&apos;s a breakdown of your answers.
          </Text>
        </div>

        {/* Score Summary Banner */}
        <Card
          padding="lg"
          className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md"
          style={{ borderRadius: "0.75rem" }}
        >
          <Group justify="space-between" align="center">
            <div>
              <Text size="xl" fw={700} className="text-[var(--color-text)]">
                Score: {submittedResult.score} / {submittedResult.totalQuestions}
              </Text>
              <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
                {percentage}% correct
              </Text>
            </div>
            <div className="flex gap-3 items-center">
              {submittedResult.isFirstAttempt && (
                <Badge color="blue" variant="light" size="lg">First Attempt</Badge>
              )}
              <Badge
                color={percentage >= 80 ? "green" : percentage >= 50 ? "yellow" : "red"}
                variant="light"
                size="lg"
              >
                {percentage >= 80 ? "Passed" : percentage >= 50 ? "Needs Work" : "Failed"}
              </Badge>
            </div>
          </Group>
        </Card>

        {/* Per-Question Answer Review */}
        <Stack gap="md">
          {quiz.questions.map((question, idx) => {
            const rawSelectedIds = answers[question.questionPublicId] ?? [];
            // Fallback to snake_case just in case the backend is configured differently
            const rawCorrectIds = question.correctAnswerIds || (question as any).correct_answer_ids || [];
            
            // Normalize all IDs to lowercase for case-insensitive comparison (helps with UUID variations)
            const selectedIds = rawSelectedIds.map(id => id.toLowerCase());
            const correctIds = rawCorrectIds.map(id => id.toLowerCase());

            const isCorrect =
              selectedIds.length === correctIds.length &&
              correctIds.every((id) => selectedIds.includes(id));

            return (
              <Card
                key={question.questionPublicId}
                padding="xl"
                className="border bg-[var(--color-surface)] shadow-sm"
                style={{
                  borderRadius: "0.75rem",
                  borderColor: isCorrect ? "var(--mantine-color-green-5)" : "var(--mantine-color-red-5)",
                }}
              >
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                    style={{
                      backgroundColor: isCorrect ? "var(--mantine-color-green-5)" : "var(--mantine-color-red-5)",
                      color: "white",
                    }}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </div>
                  <div className="flex-1 pt-1">
                    <Text size="xs" fw={700} className="uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
                      Question {idx + 1} • {question.type.replace("-", " ")}
                    </Text>
                    <Text size="md" fw={500} className="text-[var(--color-text)]">
                      {question.prompt}
                    </Text>
                  </div>
                </div>

                <Stack gap="xs" className="pl-12">
                  {question.options.map((option) => {
                    const optionIdLower = option.id.toLowerCase();
                    const wasSelected = selectedIds.includes(optionIdLower);
                    const isCorrectOption = correctIds.includes(optionIdLower);

                    let bgColor = "transparent";
                    let borderColor = "var(--color-border)";
                    let textColor = "var(--color-text)";

                    if (isCorrectOption) {
                      bgColor = "var(--mantine-color-green-0)";
                      borderColor = "var(--mantine-color-green-5)";
                      textColor = "var(--mantine-color-green-8)";
                    } else if (wasSelected && !isCorrectOption) {
                      bgColor = "var(--mantine-color-red-0)";
                      borderColor = "var(--mantine-color-red-5)";
                      textColor = "var(--mantine-color-red-8)";
                    }

                    return (
                      <div
                        key={option.id}
                        className="rounded-lg border px-4 py-2 flex items-center gap-3"
                        style={{ backgroundColor: bgColor, borderColor, color: textColor }}
                      >
                        <Text size="sm" fw={wasSelected || isCorrectOption ? 600 : 400}>
                          {option.text}
                        </Text>
                        {isCorrectOption && (
                          <Text size="xs" fw={700} className="ml-auto" style={{ color: "var(--mantine-color-green-6)" }}>
                            Correct Answer
                          </Text>
                        )}
                        {wasSelected && !isCorrectOption && (
                          <Text size="xs" fw={700} className="ml-auto" style={{ color: "var(--mantine-color-red-6)" }}>
                            Your Answer
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </Stack>
              </Card>
            );
          })}
        </Stack>

        <Group justify="flex-end" mt="sm">
          <CommonButton size="md" onClick={() => router.push(`/quiz/${lessonId}`)}>
            Back to Quizzes
          </CommonButton>
        </Group>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div>
          <Title order={2}>Quiz Overview</Title>
          <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
            {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'} • Created on {formatDateTime(quiz.createdAt)}
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
              <CommonButton mt="md" size="md" onClick={() => setIsStarted(true)}>
                Retake Quiz
              </CommonButton>
            </Stack>
          ) : (
            <Stack align="center" gap="md" py="lg">
              <Text size="lg" fw={500} className="text-[var(--color-text)]">Ready to begin?</Text>
              <CommonButton size="md" onClick={() => setIsStarted(true)}>
                Start Quiz
              </CommonButton>
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
              <CommonButton
                size="md"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={submissionBlockReason !== null}
                className="w-full sm:w-auto"
              >
                Submit Quiz
              </CommonButton>
            </Group>
          )}
        </Stack>
      </Card>

      {/* Exit Confirmation Modal */}
      <Modal
        opened={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={<Text fw={700} size="lg">Exit Quiz?</Text>}
        centered
        radius="md"
        padding="xl"
      >
        <Stack>
          <Text size="sm">
            Are you sure you want to leave? Your progress on this quiz attempt will be lost.
          </Text>
          <Group justify="flex-end" mt="md">
            <CommonButton variant="subtle" color="gray" onClick={() => setShowExitModal(false)}>
              Cancel
            </CommonButton>
            <CommonButton color="red" onClick={handleConfirmExit}>
              Yes, Exit
            </CommonButton>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
