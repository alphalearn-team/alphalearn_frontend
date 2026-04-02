"use client";

import { Card, Stack, Text, Title, Group, Badge } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { type LessonQuiz, type QuizAttemptSummary } from "@/interfaces/interfaces";
import { type LessonQuizAnswers } from "@/lib/utils/lessonQuiz";

interface QuizResultsPanelProps {
  quiz: LessonQuiz;
  answers: LessonQuizAnswers;
  submittedResult: QuizAttemptSummary;
  onBack: () => void;
}

export default function QuizResultsPanel({
  quiz,
  answers,
  submittedResult,
  onBack,
}: QuizResultsPanelProps) {
  const percentage = Math.round((submittedResult.score / submittedResult.totalQuestions) * 100);

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <Title order={2} className="text-3xl font-extrabold tracking-tight">Quiz Results</Title>
        <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
          Here&apos;s how you performed on this attempt.
        </Text>
      </div>

      {/* Score Summary Banner */}
      <Card
        padding="xl"
        className="relative overflow-hidden border-none bg-[var(--color-primary)] text-white shadow-xl"
        style={{ borderRadius: "1.25rem" }}
      >
        <Group justify="space-between" align="center" className="relative z-10">
          <div>
            <Text size="xs" fw={700} className="uppercase tracking-[0.2em] text-white/70 mb-1">
              Final Score
            </Text>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{submittedResult.score}</span>
              <span className="text-2xl text-white/50">/ {submittedResult.totalQuestions}</span>
            </div>
            <Text size="md" fw={500} className="mt-2 text-white/80">
              {percentage}% Mastery
            </Text>
          </div>
          
          <Stack align="flex-end" gap="xs">
            <Badge 
              size="xl" 
              variant="white" 
              className="px-4 py-1 text-black shadow-lg"
              style={{ height: "auto" }}
            >
              <Text fw={800} size="sm">
                {percentage >= 80 ? "PASS" : percentage >= 50 ? "IN REVIEW" : "TRY AGAIN"}
              </Text>
            </Badge>
            {submittedResult.isFirstAttempt && (
              <Text size="xs" fw={700} className="uppercase tracking-widest text-white/60">
                First Attempt
              </Text>
            )}
          </Stack>
        </Group>
      </Card>

      {/* Per-Question Answer Review */}
      <Stack gap="lg">
        {quiz.questions.map((question, idx) => {
          const rawSelectedIds = answers[question.questionPublicId] ?? [];
          const rawCorrectIds = question.correctAnswerIds || [];
          
          const selectedIds = rawSelectedIds.map((id: string) => id.toLowerCase());
          const correctIds = rawCorrectIds.map((id: string) => id.toLowerCase());

          const isCorrect =
            selectedIds.length === correctIds.length &&
            correctIds.every((id) => selectedIds.includes(id));

          return (
            <Card
              key={question.questionPublicId}
              padding={0}
              className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-all hover:shadow-md"
              style={{ borderRadius: "1rem" }}
            >
              <div className="flex min-h-full">
                {/* Result Accent Bar */}
                <div 
                  className="w-2 self-stretch" 
                  style={{ 
                    backgroundColor: isCorrect ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)" 
                  }} 
                />
                
                <div className="flex-1 p-6">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-background)] font-bold text-[var(--color-text)] shadow-inner">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <Text size="xs" fw={700} className="uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                        {question.type.replace("-", " ")}
                      </Text>
                      <Text size="lg" fw={600} className="text-[var(--color-text)] leading-tight">
                        {question.prompt}
                      </Text>
                    </div>
                    <div className={`p-2 h-9 w-9 flex items-center justify-center rounded-full font-black text-xl shadow-sm ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isCorrect ? "✓" : "✗"}
                    </div>
                  </div>

                  <Stack gap="xs">
                    {question.options.map((option) => {
                      const optionIdLower = option.id.toLowerCase();
                      const wasSelected = selectedIds.includes(optionIdLower);
                      const isCorrectOption = correctIds.includes(optionIdLower);

                      let bgColor = "transparent";
                      let borderColor = "var(--color-border)";

                      if (isCorrectOption) {
                        bgColor = "rgba(40, 199, 111, 0.08)";
                        borderColor = "var(--mantine-color-green-5)";
                      } else if (wasSelected && !isCorrectOption) {
                        bgColor = "rgba(234, 84, 85, 0.08)";
                        borderColor = "var(--mantine-color-red-5)";
                      }

                      return (
                        <div
                          key={option.id}
                          className="group relative flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                          style={{ backgroundColor: bgColor, borderColor }}
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isCorrectOption ? 'border-green-500 bg-green-500' : wasSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                            {(isCorrectOption || wasSelected) && <span className="text-[10px] text-white font-black leading-none">{isCorrectOption ? "✓" : "✗"}</span>}
                          </div>
                          
                          <Text size="sm" fw={wasSelected || isCorrectOption ? 600 : 500} className="flex-1">
                            {option.text}
                          </Text>

                          {isCorrectOption && (
                            <Badge color="green" variant="light" size="xs" className="ml-auto">Correct</Badge>
                          )}
                          {wasSelected && !isCorrectOption && (
                            <Badge color="red" variant="light" size="xs" className="ml-auto">Yours</Badge>
                          )}
                        </div>
                      );
                    })}
                  </Stack>
                </div>
              </div>
            </Card>
          );
        })}
      </Stack>

      <Group justify="center" mt="xl">
        <CommonButton size="lg" onClick={onBack}>
          Return to Quizzes
        </CommonButton>
      </Group>
    </div>
  );
}
