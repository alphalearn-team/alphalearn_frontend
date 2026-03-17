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
  attemptSummary: QuizAttemptSummary | null;
  isLoadingLatestAttempt: boolean;
  isSubmitting: boolean;
  latestAttemptError: string | null;
  submitError: string | null;
}

function createDefaultQuizState(): QuizCardState {
  return {
    answers: {},
    attemptSummary: null,
    isLoadingLatestAttempt: false,
    isSubmitting: false,
    latestAttemptError: null,
    submitError: null,
  };
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
  const [quizStates, setQuizStates] = useState<Record<string, QuizCardState>>({});
  const supportsQuizAttempts = role === "LEARNER" || role === "CONTRIBUTOR";

  useEffect(() => {
    const accessToken = session?.access_token;

    if (quizzes.length === 0) {
      return;
    }

    if (!accessToken || isOwner || !supportsQuizAttempts) {
      setQuizStates((currentStates) => {
        let hasChanges = false;
        const nextStates = { ...currentStates };

        for (const quiz of quizzes) {
          const currentState = currentStates[quiz.quizPublicId];

          if (
            currentState
            && (currentState.attemptSummary
              || currentState.isLoadingLatestAttempt
              || currentState.latestAttemptError)
          ) {
            nextStates[quiz.quizPublicId] = {
              ...currentState,
              attemptSummary: null,
              isLoadingLatestAttempt: false,
              latestAttemptError: null,
            };
            hasChanges = true;
          }
        }

        return hasChanges ? nextStates : currentStates;
      });
      return;
    }

    const abortController = new AbortController();
    let isCancelled = false;

    setQuizStates((currentStates) => {
      const nextStates = { ...currentStates };
      let hasChanges = false;

      for (const quiz of quizzes) {
        const currentState = currentStates[quiz.quizPublicId] ?? createDefaultQuizState();

        if (
          !currentState.isLoadingLatestAttempt
          || currentState.latestAttemptError !== null
        ) {
          nextStates[quiz.quizPublicId] = {
            ...currentState,
            isLoadingLatestAttempt: true,
            latestAttemptError: null,
          };
          hasChanges = true;
        }
      }

      return hasChanges ? nextStates : currentStates;
    });

    void Promise.all(
      quizzes.map(async (quiz) => {
        try {
          const latestAttempt = await apiClientFetch<QuizAttemptSummary>(
            `/me/quizzes/${quiz.quizPublicId}/attempts/latest`,
            accessToken,
            { signal: abortController.signal },
          );

          return {
            quizPublicId: quiz.quizPublicId,
            attemptSummary: latestAttempt,
            latestAttemptError: null,
          };
        } catch (error) {
          return {
            quizPublicId: quiz.quizPublicId,
            attemptSummary: null,
            latestAttemptError: toFriendlyLatestQuizAttemptError(error),
          };
        }
      }),
    ).then((results) => {
      if (isCancelled) {
        return;
      }

      setQuizStates((currentStates) => {
        const nextStates = { ...currentStates };

        for (const result of results) {
          const currentState =
            currentStates[result.quizPublicId] ?? createDefaultQuizState();
          const shouldReplaceSummary = shouldReplaceAttemptSummary(
            currentState.attemptSummary,
            result.attemptSummary,
          );

          nextStates[result.quizPublicId] = {
            ...currentState,
            attemptSummary: shouldReplaceSummary
              ? result.attemptSummary
              : currentState.attemptSummary,
            isLoadingLatestAttempt: false,
            latestAttemptError: shouldReplaceSummary
              ? result.latestAttemptError
              : currentState.latestAttemptError,
          };
        }

        return nextStates;
      });
    });

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [isOwner, quizzes, session?.access_token, supportsQuizAttempts]);

  if (quizzes.length === 0 && !quizLoadError) {
    return null;
  }

  const getQuizState = (quizPublicId: string): QuizCardState =>
    quizStates[quizPublicId] ?? createDefaultQuizState();

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
        attemptSummary: summary,
        isLoadingLatestAttempt: false,
        isSubmitting: false,
        latestAttemptError: null,
        submitError: null,
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
            hasAccessToken: Boolean(session?.access_token),
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
