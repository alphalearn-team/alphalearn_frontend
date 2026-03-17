"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Group,
  Radio,
  Stack,
  Text,
  Title,
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
  getQuizAttemptSummaryMessage,
  getUnansweredQuizQuestionIds,
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
  isSubmitting: boolean;
  submitError: string | null;
}

function createDefaultQuizState(): QuizCardState {
  return {
    answers: {},
    attemptSummary: null,
    isSubmitting: false,
    submitError: null,
  };
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
        isSubmitting: false,
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

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Lesson Quiz
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

                {submissionBlockReason === "incomplete" && helperMessage ? (
                  <Alert color="yellow" radius="lg" title="Complete the quiz">
                    {helperMessage}
                  </Alert>
                ) : null}

                {submissionBlockReason !== "incomplete" && helperMessage ? (
                  <Alert color="blue" radius="lg" title="Submission unavailable">
                    {helperMessage}
                  </Alert>
                ) : null}

                {quizState.attemptSummary ? (
                  <Alert color="green" radius="lg" title="Attempt saved">
                    <div className="space-y-2">
                      <Text size="sm">
                        Score: {quizState.attemptSummary.score} /{" "}
                        {quizState.attemptSummary.totalQuestions}
                      </Text>
                      <Text size="sm">
                        {getQuizAttemptSummaryMessage(quizState.attemptSummary)}
                      </Text>
                      <Text size="sm">
                        Attempted at {formatDateTime(quizState.attemptSummary.attemptedAt)}
                      </Text>
                    </div>
                  </Alert>
                ) : null}

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
              </Stack>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
