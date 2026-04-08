"use client";

import { useEffect, useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useQuizState } from "@/app/(protected)/(user)/quiz/_components/quizbuilder/useQuizState";
import Canvas from "@/app/(protected)/(user)/quiz/_components/quizbuilder/Canvas";
import MobileDrawer from "@/app/(protected)/(user)/quiz/_components/quizbuilder/sidebar/MobileDrawer";
import { SIDEBAR_TYPES } from "@/app/(protected)/(user)/quiz/_components/quizbuilder/types";
import type { Question, QuestionType } from "@/app/(protected)/(user)/quiz/_components/quizbuilder/types";

interface LessonInlineQuizSectionProps {
  onQuestionsChange: (questions: Question[]) => void;
  quizLabel: string;
  onRemove?: () => void;
}

export default function LessonInlineQuizSection({ onQuestionsChange, quizLabel, onRemove }: LessonInlineQuizSectionProps) {
  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useQuizState();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep the ref in sync via an effect (not during render) so the callback
  // below only re-runs when `questions` changes, not on every parent render.
  const onQuestionsChangeRef = useRef(onQuestionsChange);
  useEffect(() => {
    onQuestionsChangeRef.current = onQuestionsChange;
  });

  useEffect(() => {
    onQuestionsChangeRef.current(questions);
  }, [questions]);

  function handleAdd(type: QuestionType) {
    addQuestion(type);
  }

  return (
    <div
      className="rounded-xl border p-5 sm:p-6 space-y-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            {quizLabel}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Add quiz questions for this lesson. At least one quiz is required before submitting for review.
          </p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors"
            style={{
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
              background: "transparent",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label={`Remove ${quizLabel}`}
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Remove
          </button>
        )}
      </div>

      {/* Add question buttons */}
      <div className="flex flex-wrap gap-2">
        {SIDEBAR_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleAdd(t.id as QuestionType)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-overlay)",
              color: "var(--color-primary)",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Canvas — question list */}
      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div style={{ background: "var(--color-background)", borderRadius: 12 }}>
          <Canvas
            questions={questions}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
          />
        </div>
      </DragDropProvider>

      {/* Mobile FAB */}
      <div className="md:hidden" style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--color-primary)",
            color: "var(--color-background)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(46,255,180,0.3)",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24, fontWeight: "bold" }}>add</span>
        </button>
      </div>

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={(type) => handleAdd(type)}
      />
    </div>
  );
}
