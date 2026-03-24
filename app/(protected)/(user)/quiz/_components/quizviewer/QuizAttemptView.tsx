"use client";

import { useState, useEffect } from "react";
import { Alert, Group, Stack, Text, Title, Modal, Badge } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
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

import QuizOverviewPanel from "./QuizOverviewPanel";
import QuizResultsPanel from "./QuizResultsPanel";
import QuizQuestionCard from "./QuizQuestionCard";
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

  // Handle browser close tab
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
    window.history.pushState({ noExit: true }, "");
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.noExit) return;
      e.preventDefault();
      window.history.pushState({ noExit: true }, "");
      setShowExitModal(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isStarted, submittedResult, hasAtLeastOneAnswer]);

  const handleConfirmExit = () => {
    setShowExitModal(false);
    window.history.back();
    setTimeout(() => window.history.back(), 50);
  };

  const handleAnswerChange = (questionPublicId: string, selectedOptionIds: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionPublicId]: selectedOptionIds }));
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    const unansweredCount = getUnansweredQuizQuestionIds(quiz, answers).length;
    if (!accessToken || !canSubmitLessonQuiz({
      lessonStatus: status, role, isOwner, 
      hasAccessToken: true, allQuestionsAnswered: unansweredCount === 0, isSubmitting
    })) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClientFetch<QuizAttemptSummary>(
        `/me/quizzes/${quiz.quizPublicId}/attempts`,
        accessToken,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildQuizAttemptPayload(quiz, answers)),
        },
      );

      const result = await apiClientFetch<QuizAttemptSummary>(
        `/me/quizzes/${quiz.quizPublicId}/attempts/best`,
        accessToken
      );
      setSubmittedResult(result);
      setBestAttempt(result);
      setIsStarted(false);
      showSuccess("Quiz completed!");
    } catch (error) {
      const message = toFriendlyLessonQuizError(error);
      setSubmitError(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const unansweredCount = getUnansweredQuizQuestionIds(quiz, answers).length;
  const submissionBlockReason = getLessonQuizSubmissionBlockReason({
    lessonStatus: status, role, isOwner, 
    hasAccessToken: Boolean(accessToken), allQuestionsAnswered: unansweredCount === 0, isSubmitting
  });
  const helperMessage = getLessonQuizSubmissionHelperMessage(submissionBlockReason, unansweredCount);

  if (submittedResult) {
    return (
      <QuizResultsPanel 
        quiz={quiz} 
        answers={answers} 
        submittedResult={submittedResult} 
        onBack={() => router.push(`/quiz/${lessonId}`)} 
      />
    );
  }


  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div>
          <Title order={2} className="text-3xl font-extrabold tracking-tight">Quiz Overview</Title>
        </div>
        <QuizOverviewPanel 
          quiz={quiz} 
          bestAttempt={bestAttempt} 
          isLoadingBest={isLoadingBest} 
          onStart={() => setIsStarted(true)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Title order={2} className="text-3xl font-extrabold tracking-tight">Quiz Attempt</Title>
          <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
            Carefully select the best answer for each question.
          </Text>
        </div>
        
        {unansweredCount > 0 && (
          <Badge size="lg" variant="light" color="orange" className="h-fit">
            {unansweredCount} Questions Remaining
          </Badge>
        )}
      </div>

      <Stack gap="xl">
        {quiz.questions.map((question, idx) => (
          <QuizQuestionCard
            key={question.questionPublicId}
            question={question}
            questionIndex={idx}
            selectedOptionIds={answers[question.questionPublicId] ?? []}
            onChange={(ids) => handleAnswerChange(question.questionPublicId, ids)}
          />
        ))}

        <div className="mt-8 space-y-4">
          {submitError && <Alert color="red" radius="md">{submitError}</Alert>}
          {submissionBlockReason === "incomplete" && helperMessage && (
            <Alert color="yellow" radius="md">{helperMessage}</Alert>
          )}
          
          {(submissionBlockReason !== "owner" && submissionBlockReason !== "not-approved") && (
            <Group justify="center">
              <CommonButton
                size="xl"
                className="w-64 shadow-xl hover:translate-y-[-2px] transition-transform"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={submissionBlockReason !== null}
              >
                Submit Quiz
              </CommonButton>
            </Group>
          )}
        </div>
      </Stack>

      {/* Exit Confirmation Modal */}
      <Modal
        opened={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={<Text fw={900} size="xl" className="tracking-tight">Exit Quiz?</Text>}
        centered
        radius="lg"
        padding="xl"
        overlayProps={{ blur: 4, opacity: 0.5 }}
      >
        <Stack gap="lg">
          <Text size="md" fw={500} className="text-[var(--color-text-muted)]">
            Are you sure you want to leave? Your progress on this attempt will be reset.
          </Text>
          <Group grow>
            <CommonButton variant="outline" color="gray" onClick={() => setShowExitModal(false)}>
              Keep Working
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
