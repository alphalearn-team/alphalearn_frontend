"use client";

import { useDroppable } from "@dnd-kit/react";
import { Question } from "../types";
import QuestionCard from "../question-cards/QuestionCard";

interface CanvasProps {
    questions: Question[];
    onUpdate: (uid: string, patch: Partial<Question>) => void;
    onDelete: (uid: string) => void;
    onMove: (uid: string, direction: "up" | "down") => void;
}

export default function Canvas({ questions, onUpdate, onDelete, onMove }: CanvasProps) {
    const { ref, isDropTarget: isOver } = useDroppable({ id: "canvas" });

    return (
        <main
            ref={ref}
            style={{
                flex: 1,
                padding: 24,
                overflowY: "auto",
                background: isOver ? "#eff6ff" : "#fff",
                transition: "background 0.15s",
            }}
        >
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>Create Quiz</h1>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: 13 }}>
                Drag question types from the sidebar to build your quiz.
            </p>

            {questions.length === 0 && (
                <div
                    style={{
                        border: "2px dashed #d1d5db",
                        borderRadius: 12,
                        padding: 40,
                        textAlign: "center",
                        color: "#9ca3af",
                    }}
                >
                    Drop a question type here to get started
                </div>
            )}

            {questions.map((q, idx) => (
                <QuestionCard
                    key={q.uid}
                    question={q}
                    index={idx}
                    total={questions.length}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onMove={onMove}
                />
            ))}
        </main>
    );
}
