"use client";

import { useDroppable } from "@dnd-kit/react";
import { Question } from "../types";
import QuestionCard from "../question-cards/QuestionCard";

interface CanvasProps {
    questions: Question[];
    onUpdate: (uid: string, patch: Partial<Question>) => void;
    onDelete: (uid: string) => void;
}

function DropZone({ isEmpty }: { isEmpty: boolean }) {
    const { ref, isDropTarget: isOver } = useDroppable({ id: "canvas" });

    return (
        <div
            ref={ref}
            style={{
                border: `1px dashed ${isOver ? "var(--color-primary)" : "var(--color-border)"}`,
                borderRadius: 12,
                padding: isEmpty ? 48 : 16,
                textAlign: "center",
                color: isOver ? "var(--color-primary)" : "var(--color-text-muted)",
                fontSize: 13,
                opacity: isOver ? 1 : 0.6,
                background: isOver ? "rgba(46,255,180,0.04)" : "transparent",
                transition: "border-color 0.2s, color 0.2s, background 0.2s, opacity 0.2s",
                marginTop: isEmpty ? 0 : 12,
            }}
        >
            {isEmpty ? "Drop a question type here to get started" : "+ Drop to add another question"}
        </div>
    );
}

export default function Canvas({ questions, onUpdate, onDelete }: CanvasProps) {
    const isEmpty = questions.length === 0;

    return (
        <main
            style={{
                flex: 1,
                padding: 24,
                overflowY: "auto",
                background: "var(--color-background)",
            }}
        >
            <h1
                style={{
                    margin: "0 0 4px",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--color-text)",
                    letterSpacing: "-0.01em",
                }}
            >
                Create Quiz
            </h1>
            <p
                style={{
                    margin: "0 0 24px",
                    color: "var(--color-text-muted)",
                    fontSize: 13,
                }}
            >
                Drag question types from the sidebar to build your quiz.
            </p>

            {questions.map((q, idx) => (
                <QuestionCard
                    key={q.uid}
                    question={q}
                    index={idx}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            ))}

            <DropZone isEmpty={isEmpty} />
        </main>
    );
}
