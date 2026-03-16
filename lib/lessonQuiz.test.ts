import assert from "node:assert/strict";
import test from "node:test";
import type {
  LessonQuiz,
  QuizAttemptSummary,
} from "@/interfaces/interfaces";
import {
  buildQuizAttemptPayload,
  canSubmitLessonQuiz,
  getLessonQuizSubmissionBlockReason,
  getQuizAttemptSummaryMessage,
  getUnansweredQuizQuestionIds,
} from "./lessonQuiz";

function makeQuiz(): LessonQuiz {
  return {
    quizPublicId: "quiz-1",
    lessonPublicId: "lesson-1",
    createdAt: "2026-03-16T12:00:00.000Z",
    questions: [
      {
        questionPublicId: "question-single",
        type: "single-choice",
        prompt: "Pick one",
        orderIndex: 0,
        options: [
          { id: "single-a", text: "A" },
          { id: "single-b", text: "B" },
        ],
      },
      {
        questionPublicId: "question-multi",
        type: "multiple-choice",
        prompt: "Pick many",
        orderIndex: 1,
        options: [
          { id: "multi-a", text: "A" },
          { id: "multi-b", text: "B" },
          { id: "multi-c", text: "C" },
        ],
      },
      {
        questionPublicId: "question-bool",
        type: "true-false",
        prompt: "True or false",
        orderIndex: 2,
        options: [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ],
      },
    ],
  };
}

test("buildQuizAttemptPayload preserves quiz order for all supported question types", () => {
  const quiz = makeQuiz();

  const payload = buildQuizAttemptPayload(quiz, {
    "question-single": ["single-b"],
    "question-multi": ["multi-a", "multi-c"],
    "question-bool": ["true"],
  });

  assert.deepEqual(payload, {
    answers: [
      {
        questionPublicId: "question-single",
        selectedOptionIds: ["single-b"],
      },
      {
        questionPublicId: "question-multi",
        selectedOptionIds: ["multi-a", "multi-c"],
      },
      {
        questionPublicId: "question-bool",
        selectedOptionIds: ["true"],
      },
    ],
  });
});

test("getUnansweredQuizQuestionIds returns every unanswered required question", () => {
  const quiz = makeQuiz();

  const unanswered = getUnansweredQuizQuestionIds(quiz, {
    "question-single": ["single-a"],
    "question-multi": [],
  });

  assert.deepEqual(unanswered, ["question-multi", "question-bool"]);
});

test("quiz submission is blocked for non-approved lessons", () => {
  assert.equal(
    getLessonQuizSubmissionBlockReason({
      lessonStatus: "PENDING",
      role: "LEARNER",
      isOwner: false,
      hasAccessToken: true,
      allQuestionsAnswered: true,
      isSubmitting: false,
    }),
    "not-approved",
  );
});

test("quiz submission is blocked for non-learner roles", () => {
  assert.equal(
    getLessonQuizSubmissionBlockReason({
      lessonStatus: "APPROVED",
      role: "CONTRIBUTOR",
      isOwner: false,
      hasAccessToken: true,
      allQuestionsAnswered: true,
      isSubmitting: false,
    }),
    "not-learner",
  );
});

test("quiz submission is blocked for lesson owners", () => {
  assert.equal(
    getLessonQuizSubmissionBlockReason({
      lessonStatus: "APPROVED",
      role: "LEARNER",
      isOwner: true,
      hasAccessToken: true,
      allQuestionsAnswered: true,
      isSubmitting: false,
    }),
    "owner",
  );
});

test("canSubmitLessonQuiz requires approved learner, non-owner, authenticated, complete state", () => {
  assert.equal(
    canSubmitLessonQuiz({
      lessonStatus: "APPROVED",
      role: "LEARNER",
      isOwner: false,
      hasAccessToken: true,
      allQuestionsAnswered: true,
      isSubmitting: false,
    }),
    true,
  );

  assert.equal(
    canSubmitLessonQuiz({
      lessonStatus: "APPROVED",
      role: "LEARNER",
      isOwner: false,
      hasAccessToken: true,
      allQuestionsAnswered: false,
      isSubmitting: false,
    }),
    false,
  );
});

test("getQuizAttemptSummaryMessage distinguishes first attempts", () => {
  const firstAttempt: QuizAttemptSummary = {
    quizPublicId: "quiz-1",
    attemptedAt: "2026-03-16T12:00:00.000Z",
    score: 3,
    totalQuestions: 3,
    isFirstAttempt: true,
  };

  const repeatAttempt: QuizAttemptSummary = {
    ...firstAttempt,
    isFirstAttempt: false,
  };

  assert.equal(getQuizAttemptSummaryMessage(firstAttempt), "First attempt recorded.");
  assert.equal(getQuizAttemptSummaryMessage(repeatAttempt), "Attempt recorded.");
});
