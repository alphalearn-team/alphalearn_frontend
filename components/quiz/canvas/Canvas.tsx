"use client";

import { useDroppable } from "@dnd-kit/react";
import { Question, QuestionPatch } from "../types";
import QuestionCard from "../question-cards/QuestionCard";

interface CanvasProps {
    questions: Question[];
    onUpdate: (uid: string, patch: QuestionPatch) => void;
    onDelete: (uid: string) => void;
}

function GapZone({ index }: { index: number }) {
    const { ref, isDropTarget: isOver } = useDroppable({ id: `gap-${index}` });

    return (
        <div
            ref={ref}
            style={{
                height: isOver ? 52 : 10,
                marginBottom: isOver ? 8 : 0,
                border: isOver ? "1px dashed var(--color-primary)" : "none",
                borderRadius: 8,
                background: isOver ? "rgba(46,255,180,0.05)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
                fontSize: 12,
                fontWeight: 600,
                transition: "height 0.15s, border 0.15s, background 0.15s",
                overflow: "hidden",
            }}
        >
            {isOver && "+ Insert here"}
        </div>
    );
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
                <div key={q.uid}>
                    {/* Gap zone before each card — allows inserting at position idx */}
                    <GapZone index={idx} />
                    <QuestionCard
                        question={q}
                        index={idx}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                </div>
            ))}

            <DropZone isEmpty={isEmpty} />
        </main>
    );
}
