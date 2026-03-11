"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useState } from "react";
import { Question, QuestionType, SIDEBAR_TYPES, makeQuestion } from "./types";
import QuestionTypeSidebar from "./sidebar/QuestionTypeSidebar";
import Canvas from "./canvas/Canvas";

export default function QuizBuilder() {
    const [questions, setQuestions] = useState<Question[]>([]);


    function handleDragStart(_event: any) {

    }

    // Fires repeatedly as the dragged item moves over new targets → reorder live
    function handleDragMove(event: any) {
        const { source, target } = event.operation;
        if (!source || !target) return;

        setQuestions((prev) => {
            const fromIdx = prev.findIndex((q) => q.uid === source.id);
            const toIdx = prev.findIndex((q) => q.uid === target.id);
            if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
        });
    }

    function handleDragEnd(event: any) {
        if (event.canceled) return;

        const { source, target } = event.operation;
        if (!source || !target) return;

        // Only handle sidebar tile drops (card-to-card sorting is handled live in onDragOver)
        if (!SIDEBAR_TYPES.some((t) => t.id === source.id)) return;

        const type = source.id as QuestionType;

        // Dropped on a gap zone → insert at that index
        if (typeof target.id === "string" && target.id.startsWith("gap-")) {
            const insertAt = parseInt(target.id.split("-")[1], 10);
            setQuestions((prev) => {
                const next = [...prev];
                next.splice(insertAt, 0, makeQuestion(type));
                return next;
            });
            return;
        }

        // Dropped on the bottom canvas zone → append
        if (target.id === "canvas") {
            setQuestions((prev) => [...prev, makeQuestion(type)]);
        }
    }


    function updateQuestion(uid: string, patch: Partial<Question>) {
        setQuestions((prev) =>
            prev.map((q) => (q.uid === uid ? { ...q, ...patch } : q))
        );
    }

    function deleteQuestion(uid: string) {
        setQuestions((prev) => prev.filter((q) => q.uid !== uid));
    }


    function saveQuiz() {
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
                onClick={saveQuiz}
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

            <DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragMove} onDragEnd={handleDragEnd}>
                <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                    <QuestionTypeSidebar />
                    <Canvas
                        questions={questions}
                        onUpdate={updateQuestion}
                        onDelete={deleteQuestion}
                    />
                </div>

                <DragOverlay dropAnimation={null}>
                    {(source) => {
                        const tile = SIDEBAR_TYPES.find((t) => t.id === source?.id);
                        if (!tile) return null;
                        return (
                            <div
                                style={{
                                    width: 212,
                                    padding: "12px",
                                    backgroundColor: "var(--color-card-bg)",
                                    border: "1px solid var(--color-primary)",
                                    borderRadius: 10,
                                    pointerEvents: "none",
                                    boxShadow: "0 8px 24px rgba(46,255,180,0.2), 0 2px 8px rgba(0,0,0,0.4)",
                                    cursor: "grabbing",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 8,
                                        background: "rgba(46,255,180,0.15)",
                                        border: "1px solid rgba(46,255,180,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>
                                        {tile.icon}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-primary)" }}>
                                        {tile.label}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                                        {tile.description}
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                </DragOverlay>
            </DragDropProvider>
        </div>
    );
}
