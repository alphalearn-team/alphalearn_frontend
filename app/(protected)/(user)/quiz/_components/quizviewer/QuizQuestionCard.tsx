"use client";

import { Card, Stack, Text, Radio, Checkbox } from "@mantine/core";
import type { LessonQuizQuestion } from "@/interfaces/interfaces";

interface QuizQuestionCardProps {
  question: LessonQuizQuestion;
  questionIndex: number;
  selectedOptionIds: string[];
  onChange: (selectedOptionIds: string[]) => void;
}

export default function QuizQuestionCard({
  question,
  questionIndex,
  selectedOptionIds,
  onChange,
}: QuizQuestionCardProps) {
  const isMulti = question.type === "multiple-choice";

  return (
    <Card
      padding="xl"
      className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md transition-shadow hover:shadow-lg"
      style={{ borderRadius: "1.25rem" }}
    >
      {/* Question Header */}
      <div className="mb-8 flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-black shadow-lg"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            transform: "rotate(-3deg)",
          }}
        >
          {questionIndex + 1}
        </div>
        <div className="flex-1 pt-1">
          <Text
            size="xs"
            fw={800}
            className="uppercase tracking-[0.25em] text-[var(--color-primary)] opacity-70 mb-2"
          >
            {question.type.replace("-", " ")}
          </Text>
          <Text size="xl" fw={700} className="text-[var(--color-text)] leading-tight">
            {question.prompt}
          </Text>
        </div>
      </div>

      {/* Options - Minimal & Robust using Mantine components */}
      <div className="pl-0 sm:pl-16">
        {isMulti ? (
          <Checkbox.Group
            value={selectedOptionIds}
            onChange={onChange}
          >
            <Stack gap="sm">
              {question.options.map((option) => (
                <Checkbox
                  key={option.id}
                  value={option.id}
                  label={option.text}
                  size="md"
                  variant="outline"
                  color="var(--color-primary)"
                  styles={{
                    label: { color: "var(--color-text)", cursor: "pointer", fontWeight: 500, paddingLeft: 12 },
                    inner: { cursor: "pointer" }
                  }}
                />
              ))}
            </Stack>
          </Checkbox.Group>
        ) : (
          <Radio.Group
            value={selectedOptionIds[0] ?? ""}
            onChange={(val) => onChange(val ? [val] : [])}
          >
            <Stack gap="sm">
              {question.options.map((option) => (
                <Radio
                  key={option.id}
                  value={option.id}
                  label={option.text}
                  size="md"
                  variant="outline"
                  color="var(--color-primary)"
                  styles={{
                    label: { color: "var(--color-text)", cursor: "pointer", fontWeight: 500, paddingLeft: 12 },
                    inner: { cursor: "pointer" }
                  }}
                />
              ))}
            </Stack>
          </Radio.Group>
        )}
      </div>
    </Card>
  );
}
