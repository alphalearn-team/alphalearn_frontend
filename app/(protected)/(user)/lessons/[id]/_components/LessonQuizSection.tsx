"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Group,
  Radio,
  Stack,
  Text,
} from "@mantine/core";
import { useAuth } from "@/context/AuthContext";
import type { LessonQuiz, QuizAttemptSummary } from "@/interfaces/interfaces";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { apiClientFetch } from "@/lib/apiClient";
import type { UserRole } from "@/lib/auth/rbac";
import { formatDateTime } from "@/lib/formatDate";
import {
  buildQuizAttemptPayload,
  canSubmitLessonQuiz,
  getLessonQuizSubmissionBlockReason,
  getLessonQuizSubmissionHelperMessage,
  getUnansweredQuizQuestionIds,
  toFriendlyLatestQuizAttemptError,
  toFriendlyLessonQuizError,
  type LessonQuizAnswers,
} from "@/lib/lessonQuiz";

interface LessonQuizSectionProps {
  isOwner: boolean;
  quizLoadError: string | null;
  quizzes: LessonQuiz[];
  role: UserRole;
  status: string;
}

interface QuizCardState {
  answers: LessonQuizAnswers;
  isSubmitting: boolean;
  submitError: string | null;
}

function createDefaultQuizState(): QuizCardState {
  return {
    answers: {},
    isSubmitting: false,
    submitError: null,
  };
}

interface QuizLatestAttemptState {
  attemptSummary: QuizAttemptSummary | null;
  isLoadingLatestAttempt: boolean;
  latestAttemptError: string | null;
}

interface StoredQuizLatestAttemptState {
  attemptSummary: QuizAttemptSummary | null;
  fetchKey: string;
  latestAttemptError: string | null;
}

type ResolvedQuizCardState = QuizCardState & QuizLatestAttemptState;

function buildLatestAttemptFetchKey(accessToken: string, quizPublicId: string): string {
  return `${accessToken}:${quizPublicId}`;
}

function shouldReplaceAttemptSummary(
  currentSummary: QuizAttemptSummary | null,
  nextSummary: QuizAttemptSummary | null,
): boolean {
  if (!currentSummary) {
    return true;
  }

  if (!nextSummary) {
    return false;
  }

  return Date.parse(nextSummary.attemptedAt) >= Date.parse(currentSummary.attemptedAt);
}

export default function LessonQuizSection({
  isOwner,
  quizLoadError,
  quizzes,
  role,
  status,
}: LessonQuizSectionProps) {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const [quizStates, setQuizStates] = useState<Record<string, QuizCardState>>({});
  const [latestAttemptStates, setLatestAttemptStates] = useState<
    Record<string, StoredQuizLatestAttemptState>
  >({});
  const supportsQuizAttempts = role === "LEARNER" || role === "CONTRIBUTOR";
  const canLoadLatestAttempts = Boolean(accessToken) && !isOwner && supportsQuizAttempts;

  useEffect(() => {
    if (!accessToken || !canLoadLatestAttempts || quizzes.length === 0) {
      return;
    }

    const abortController = new AbortController();
    let isCancelled = false;

    void Promise.all(
      quizzes.map(async (quiz) => {
        const fetchKey = buildLatestAttemptFetchKey(accessToken, quiz.quizPublicId);

        try {
          const latestAttempt = await apiClientFetch<QuizAttemptSummary>(
            `/me/quizzes/${quiz.quizPublicId}/attempts/latest`,
            accessToken,
            { signal: abortController.signal },
          );

          return {
            quizPublicId: quiz.quizPublicId,
            fetchKey,
            attemptSummary: latestAttempt,
            latestAttemptError: null,
          };
        } catch (error) {
          return {
            quizPublicId: quiz.quizPublicId,
            fetchKey,
            attemptSummary: null,
            latestAttemptError: toFriendlyLatestQuizAttemptError(error),
          };
        }
      }),
    ).then((results) => {
      if (isCancelled) {
        return;
      }

      setLatestAttemptStates((currentStates) => {
        const nextStates = { ...currentStates };

        for (const result of results) {
          const currentState = currentStates[result.quizPublicId];
          const shouldReplaceSummary = shouldReplaceAttemptSummary(
            currentState?.fetchKey === result.fetchKey
              ? currentState.attemptSummary
              : null,
            result.attemptSummary,
          );

          nextStates[result.quizPublicId] = {
            fetchKey: result.fetchKey,
            attemptSummary: shouldReplaceSummary
              ? result.attemptSummary
              : currentState?.attemptSummary ?? null,
            latestAttemptError: shouldReplaceSummary
              ? result.latestAttemptError
              : currentState?.latestAttemptError ?? null,
          };
        }

        return nextStates;
      });
    });

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [accessToken, canLoadLatestAttempts, quizzes]);

  if (quizzes.length === 0 && !quizLoadError) {
    return null;
  }

  const getLatestAttemptState = (quizPublicId: string): QuizLatestAttemptState => {
    if (!accessToken || !canLoadLatestAttempts) {
      return {
        attemptSummary: null,
        isLoadingLatestAttempt: false,
        latestAttemptError: null,
      };
    }

    const fetchKey = buildLatestAttemptFetchKey(accessToken, quizPublicId);
    const currentState = latestAttemptStates[quizPublicId];
    const hasCurrentFetchResult = currentState?.fetchKey === fetchKey;

    return {
      attemptSummary: hasCurrentFetchResult ? currentState.attemptSummary : null,
      isLoadingLatestAttempt: !hasCurrentFetchResult,
      latestAttemptError: hasCurrentFetchResult ? currentState.latestAttemptError : null,
    };
  };

  const getQuizState = (quizPublicId: string): ResolvedQuizCardState => ({
    ...(quizStates[quizPublicId] ?? createDefaultQuizState()),
    ...getLatestAttemptState(quizPublicId),
  });

  const updateQuizState = (
    quizPublicId: string,
    updater: (currentState: QuizCardState) => QuizCardState,
  ) => {
    setQuizStates((currentStates) => ({
      ...currentStates,
      [quizPublicId]: updater(currentStates[quizPublicId] ?? createDefaultQuizState()),
    }));
  };

  const setSelectedOptionIds = (
    quizPublicId: string,
    questionPublicId: string,
    selectedOptionIds: string[],
  ) => {
    updateQuizState(quizPublicId, (currentState) => ({
      ...currentState,
      answers: {
        ...currentState.answers,
        [questionPublicId]: selectedOptionIds,
      },
      submitError: null,
    }));
  };

  const handleSubmit = async (quiz: LessonQuiz) => {
    const accessToken = session?.access_token;
    const quizState = getQuizState(quiz.quizPublicId);
    const unansweredQuestionIds = getUnansweredQuizQuestionIds(quiz, quizState.answers);
    const allQuestionsAnswered = unansweredQuestionIds.length === 0;

    if (!canSubmitLessonQuiz({
      lessonStatus: status,
      role,
      isOwner,
      hasAccessToken: Boolean(accessToken),
      allQuestionsAnswered,
      isSubmitting: quizState.isSubmitting,
    })) {
      return;
    }

    if (!accessToken) {
      return;
    }

    updateQuizState(quiz.quizPublicId, (currentState) => ({
      ...currentState,
      isSubmitting: true,
      submitError: null,
    }));

    try {
      const summary = await apiClientFetch<QuizAttemptSummary>(
        `/me/quizzes/${quiz.quizPublicId}/attempts`,
        accessToken,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildQuizAttemptPayload(quiz, quizState.answers)),
        },
      );

      updateQuizState(quiz.quizPublicId, (currentState) => ({
        ...currentState,
        isSubmitting: false,
        submitError: null,
      }));
      setLatestAttemptStates((currentStates) => ({
        ...currentStates,
        [quiz.quizPublicId]: {
          attemptSummary: summary,
          fetchKey: buildLatestAttemptFetchKey(accessToken, quiz.quizPublicId),
          latestAttemptError: null,
        },
      }));
      showSuccess("Quiz submitted successfully.");
    } catch (error) {
      const message = toFriendlyLessonQuizError(error);
      updateQuizState(quiz.quizPublicId, (currentState) => ({
        ...currentState,
        isSubmitting: false,
        submitError: message,
      }));
      showError(message);
    }
  };

  const quizSectionTitle = quizzes.length === 1 ? "Lesson Quiz" : "Lesson Quizzes";

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          {quizSectionTitle}
        </h2>
      </div>

      <div className="space-y-6">
        {quizLoadError ? (
          <Alert color="yellow" radius="lg" title="Quiz unavailable">
            {quizLoadError}
          </Alert>
        ) : null}

        {quizzes.map((quiz, quizIndex) => {
          const quizState = getQuizState(quiz.quizPublicId);
          const unansweredQuestionIds = getUnansweredQuizQuestionIds(quiz, quizState.answers);
          const unansweredCount = unansweredQuestionIds.length;
          const submissionBlockReason = getLessonQuizSubmissionBlockReason({
            lessonStatus: status,
            role,
            isOwner,
            hasAccessToken: Boolean(accessToken),
            allQuestionsAnswered: unansweredCount === 0,
            isSubmitting: quizState.isSubmitting,
          });
          const helperMessage = getLessonQuizSubmissionHelperMessage(
            submissionBlockReason,
            unansweredCount,
          );
          const submitLabel = quizState.attemptSummary
            ? "Submit Another Attempt"
            : "Submit Quiz";
          const shouldHideSubmitButton =
            submissionBlockReason === "owner"
            || submissionBlockReason === "not-approved";

          return (
            <Card
              key={quiz.quizPublicId}
              padding="xl"
              className="border border-[var(--color-border)] bg-[var(--color-surface)]"
              style={{ borderRadius: "0.75rem" }}
            >
              <Stack gap="lg">
                <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Text
                      size="xs"
                      fw={700}
                      className="uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
                    >
                      Quiz {quizIndex + 1}
                    </Text>
                  </div>
                  <Text size="sm" className="text-[var(--color-text-muted)]">
                    {formatDateTime(quiz.createdAt)}
                  </Text>
                </div>

                {quiz.questions.map((question, questionIndex) => {
                  const selectedOptionIds =
                    quizState.answers[question.questionPublicId] ?? [];

                  return (
                    <div
                      key={question.questionPublicId}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5"
                    >
                      <div className="mb-4 flex items-start gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-surface)",
                          }}
                        >
                          {questionIndex + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Text
                            size="xs"
                            fw={700}
                            className="uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                          >
                            {question.type.replace("-", " ")}
                          </Text>
                          <Text className="mt-2 text-[var(--color-text)]">
                            {question.prompt}
                          </Text>
                        </div>
                      </div>
                      {question.type === "multiple-choice" ? (
                        <Checkbox.Group
                          value={selectedOptionIds}
                          onChange={(value) =>
                            setSelectedOptionIds(
                              quiz.quizPublicId,
                              question.questionPublicId,
                              value,
                            )
                          }
                        >
                          <Stack gap="sm">
                            {question.options.map((option) => (
                              <Checkbox
                                key={option.id}
                                value={option.id}
                                label={option.text}
                                styles={{
                                  label: { color: "var(--color-text)" },
                                }}
                              />
                            ))}
                          </Stack>
                        </Checkbox.Group>
                      ) : (
                        <Radio.Group
                          value={selectedOptionIds[0] ?? ""}
                          onChange={(value) =>
                            setSelectedOptionIds(
                              quiz.quizPublicId,
                              question.questionPublicId,
                              value ? [value] : [],
                            )
                          }
                        >
                          <Stack gap="sm">
                            {question.options.map((option) => (
                              <Radio
                                key={option.id}
                                value={option.id}
                                label={option.text}
                                styles={{
                                  label: { color: "var(--color-text)" },
                                }}
                              />
                            ))}
                          </Stack>
                        </Radio.Group>
                      )}
                    </div>
                  );
                })}

                {quizState.submitError ? (
                  <Alert color="red" radius="lg" title="Submission error">
                    {quizState.submitError}
                  </Alert>
                ) : null}

                {quizState.latestAttemptError ? (
                  <Alert color="yellow" radius="lg" title="Latest attempt unavailable">
                    {quizState.latestAttemptError}
                  </Alert>
                ) : null}

                {submissionBlockReason === "incomplete"
                  && !quizState.isLoadingLatestAttempt
                  && !quizState.attemptSummary
                  && helperMessage ? (
                  <Alert color="yellow" radius="lg" title="Complete the quiz">
                  </Alert>
                ) : null}

                {submissionBlockReason !== "incomplete"
                  && submissionBlockReason !== "not-approved"
                  && submissionBlockReason !== "owner"
                  && helperMessage ? (
                  <Alert color="blue" radius="lg" title="Submission unavailable">
                    {helperMessage}
                  </Alert>
                ) : null}

                {quizState.attemptSummary ? (
                  <Alert
                    color="green"
                    radius="lg"
                    title={
                      quizState.attemptSummary.isFirstAttempt
                        ? "First Attempt Score"
                        : "Your last attempt"
                    }
                  >
                    <div className="space-y-2">
                      <Text size="sm">
                        You scored {quizState.attemptSummary.score}/
                        {quizState.attemptSummary.totalQuestions}
                      </Text>
                      <Text size="sm">
                        Taken on {formatDateTime(quizState.attemptSummary.attemptedAt)}
                      </Text>
                    </div>
                  </Alert>
                ) : null}

                {!shouldHideSubmitButton && (
                  <Group justify="flex-end">
                    <Button
                      radius="xl"
                      onClick={() => handleSubmit(quiz)}
                      loading={quizState.isSubmitting}
                      disabled={submissionBlockReason !== null}
                      className="w-full sm:w-auto"
                    >
                      {quizState.isSubmitting ? "Submitting..." : submitLabel}
                    </Button>
                  </Group>
                )}
              </Stack>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
