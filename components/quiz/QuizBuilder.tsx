"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useState } from "react";
import { Question, QuestionType, SIDEBAR_TYPES, makeQuestion } from "./types";
import QuestionTypeSidebar from "./sidebar/QuestionTypeSidebar";
import Canvas from "./canvas/Canvas";

export default function QuizBuilder() {
    const [questions, setQuestions] = useState<Question[]>([]);

    // ── drag handlers ──────────────────────────────────────────────────────────

    function handleDragStart(_event: any) {
        // reserved for future ghost-state logic
    }

    function handleDragEnd(event: any) {
        if (event.canceled) return;

        const { source, target } = event.operation;
        if (!source || !target) return;

        if (target.id === "canvas") {
            const type = source.id as QuestionType;
            if (SIDEBAR_TYPES.some((t) => t.id === type)) {
                setQuestions((prev) => [...prev, makeQuestion(type)]);
            }
        }
    }

    // ── question mutation helpers ──────────────────────────────────────────────

    function updateQuestion(uid: string, patch: Partial<Question>) {
        setQuestions((prev) =>
            prev.map((q) => (q.uid === uid ? { ...q, ...patch } : q))
        );
    }

    function deleteQuestion(uid: string) {
        setQuestions((prev) => prev.filter((q) => q.uid !== uid));
    }

    function moveQuestion(uid: string, direction: "up" | "down") {
        setQuestions((prev) => {
            const idx = prev.findIndex((q) => q.uid === uid);
            if (idx === -1) return prev;
            const next = [...prev];
            const swapIdx = direction === "up" ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= next.length) return prev;
            [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
            return next;
        });
    }

    // ── serialise ──────────────────────────────────────────────────────────────

    function serializeQuiz() {
        const payload = {
            questions: questions.map((q, idx) => {
                const base = {
                    index: idx + 1,
                    id: q.uid,
                    type: q.type,
                    prompt: q.prompt,
                };

                if (q.type === "multiple-choice") {
                    return {
                        ...base,
                        options: q.options.map((o) => ({ id: o.id, text: o.text })),
                        correctOptionIds: q.correctOptionIds,
                    };
                }

                if (q.type === "true-false") {
                    return {
                        ...base,
                        correctAnswer: q.correctBoolean,
                    };
                }

                return base;
            }),
        };

        console.log("[Quiz JSON]", JSON.stringify(payload, null, 2));
    }

    // ──────────────────────────────────────────────────────────────────────────

    return (
        <div style={{ position: "relative", height: "100vh" }}>
            {/* Save button lives OUTSIDE DragDropProvider so dnd-kit doesn't swallow the click */}
            <button
                onClick={serializeQuiz}
                style={{
                    position: "absolute",
                    top: 20,
                    right: 24,
                    zIndex: 10,
                    padding: "7px 18px",
                    background: "#1d4ed8",
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                Save quiz
            </button>

            <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                    <QuestionTypeSidebar />
                    <Canvas
                        questions={questions}
                        onUpdate={updateQuestion}
                        onDelete={deleteQuestion}
                        onMove={moveQuestion}
                    />
                </div>

                <DragOverlay>
                    {(source) =>
                        source ? (
                            <div
                                style={{
                                    padding: "8px 12px",
                                    background: "#1d4ed8",
                                    color: "#fff",
                                    borderRadius: 6,
                                    fontSize: 14,
                                    pointerEvents: "none",
                                }}
                            >
                                {SIDEBAR_TYPES.find((t) => t.id === source.id)?.label ?? source.id}
                            </div>
                        ) : null
                    }
                </DragOverlay>
            </DragDropProvider>
        </div>
    );
}
