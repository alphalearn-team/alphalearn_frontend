"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Modal, Select } from "@mantine/core";
import { Question, QuestionPatch, QuestionType, SIDEBAR_TYPES, makeQuestion } from "./types";
import { createQuizAction } from "@/lib/actions/quiz";
import { fetchMyLessonsAction } from "@/lib/actions/lesson";
import QuestionTypeSidebar from "./sidebar/QuestionTypeSidebar";
import Canvas from "./canvas/Canvas";
import GradientButton from "../common/GradientButton";

export default function QuizBuilder() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Save Modal State
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [availableLessons, setAvailableLessons] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        setMounted(true);
        // Fetch lessons for the modal
        fetchMyLessonsAction().then((res) => {
            if (res.success && res.data) {
                setAvailableLessons(res.data.map((lesson) => ({
                    value: lesson.lessonPublicId,
                    label: lesson.title
                })));
            }
        });
    }, []);

    function addQuestion(type: QuestionType) {
        setQuestions((prev) => [...prev, makeQuestion(type)]);
    }


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


    function updateQuestion(uid: string, patch: QuestionPatch) {
        setQuestions((prev) =>
            prev.map((q) => (q.uid === uid ? { ...q, ...patch } as Question : q))
        );
    }

    function deleteQuestion(uid: string) {
        setQuestions((prev) => prev.filter((q) => q.uid !== uid));
    }


    // Example mock lessons to select from (In reality, fetch from API)
    const mockLessons = [
        { value: "e40c07c9-ccf4-4ef6-8264-19b5c3ca905e", label: "Lesson 1: Intro to React" },
        { value: "00000000-0000-0000-0000-000000000002", label: "Lesson 2: Advanced Hooks" }
    ];

    async function handleSaveConfirm() {
        if (!selectedLessonId) {
            alert("Please select a lesson to attach this quiz to.");
            return;
        }

        if (questions.length === 0) {
            alert("Add at least one question before saving.");
            return;
        }

        setIsSaving(true);
        console.log("Saving quiz...");

        try {
            const payload = {
                title: "New Custom Quiz", // TODO: Add title input to Quiz Builder
                description: "Auto-generated quiz description.",
                lessonPublicId: selectedLessonId,
                questions: questions.map((q, idx) => {
                    const base = {
                        type: q.type,
                        prompt: q.prompt || "Empty Question",
                    };

                    if (q.type === "multiple-choice") {
                        return {
                            ...base,
                            properties: {
                                options: q.options.map((o) => ({ id: o.id, text: o.text || "Empty Option" })),
                                correctOptionIds: q.correctOptionIds.length > 0 ? q.correctOptionIds : [q.options[0]?.id],
                            }
                        };
                    }

                    if (q.type === "true-false") {
                        return {
                            ...base,
                            properties: {
                                correctBoolean: q.correctBoolean,
                            }
                        };
                    }

                    return base;
                }),
            };

            const result = await createQuizAction(payload);

            if (!result.success) {
                throw new Error(result.error);
            }

            alert("Quiz saved successfully!");
            setSaveModalOpen(false);

            // Optional: Redirect to a dashboard or lesson page
            // router.push("/dashboard");

        } catch (error: any) {
            console.error(error);
            alert(error.message || "An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────

    return (
        <div style={{ position: "relative", height: "100vh" }}>
            {/* Save button lives OUTSIDE DragDropProvider so dnd-kit doesn't swallow the click */}
            {/* Save button lives OUTSIDE DragDropProvider so dnd-kit doesn't swallow the click */}
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
                <GradientButton
                    onClick={() => setSaveModalOpen(true)}
                    size="sm"
                    icon="save"
                >
                    Save Quiz
                </GradientButton>
            </div>

            <DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragMove} onDragEnd={handleDragEnd}>
                <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                    <div className="hidden md:block">
                        <QuestionTypeSidebar />
                    </div>
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

            {/* Mobile Drawer (Portaled to body to escape all stacking contexts) */}
            {mounted && createPortal(
                <div className="md:hidden">
                    {/* Floating Action Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setDrawerOpen(true);
                        }}
                        style={{
                            position: "fixed", bottom: 24, right: 24, zIndex: 90,
                            width: 56, height: 56, borderRadius: "50%",
                            background: "var(--color-primary)", color: "#000",
                            border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 20px rgba(46,255,180,0.35)",
                            touchAction: "manipulation",
                            WebkitTapHighlightColor: "transparent"
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
                    </button>

                    {/* Backdrop */}
                    <div
                        onClick={() => setDrawerOpen(false)}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(0,0,0,0.6)",
                            zIndex: 100,
                            opacity: drawerOpen ? 1 : 0,
                            pointerEvents: drawerOpen ? "auto" : "none",
                            transition: "opacity 0.2s",
                        }}
                    />

                    {/* Drawer Panel */}
                    <div
                        style={{
                            position: "fixed", bottom: 0, left: 0, right: 0,
                            zIndex: 100000,
                            background: "var(--color-surface)",
                            borderTop: "1px solid var(--color-border)",
                            borderRadius: "24px 24px 0 0",
                            padding: "24px 24px 40px",
                            transform: drawerOpen ? "translateY(0)" : "translateY(100%)",
                            transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
                            boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                            <p style={{ margin: 0, flex: 1, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-text-muted)" }}>
                                Add Question
                            </p>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: 24, padding: 8, margin: "-8px -8px -8px 0", cursor: "pointer" }}
                            >
                                ✕
                            </button>
                        </div>

                        {SIDEBAR_TYPES.map((t) => (
                            <button
                                key={t.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    addQuestion(t.id);
                                }}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: 16,
                                    padding: 16, marginBottom: 12,
                                    background: "rgba(156,163,175,0.05)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: 12, cursor: "pointer", textAlign: "left",
                                    touchAction: "manipulation",
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: "rgba(46,255,180,0.1)", border: "1px solid rgba(46,255,180,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--color-primary)" }}>{t.icon}</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>{t.label}</div>
                                    <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>{t.description}</div>
                                </div>
                            </button>
                        ))}
                        <div style={{ marginTop: 20 }}>
                            <GradientButton onClick={() => setDrawerOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
                                DONE
                            </GradientButton>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Save Quiz Modal */}
            <Modal
                opened={saveModalOpen}
                onClose={() => !isSaving && setSaveModalOpen(false)}
                title={<span style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--color-primary)" }}>Finish & Save Quiz</span>}
                centered
                overlayProps={{ blur: 12, backgroundOpacity: 0.7, color: "#000" }}
                styles={{
                    content: { backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16 },
                    header: { backgroundColor: "transparent" },
                    close: { color: "var(--color-text-muted)", "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" } }
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <p style={{ color: "var(--color-text-dimmed)", fontSize: "0.95rem", margin: 0 }}>
                        Select the lesson you want to attach this quiz to.
                    </p>

                    <Select
                        label="Target Lesson"
                        placeholder="Pick a lesson"
                        data={availableLessons}
                        value={selectedLessonId}
                        onChange={setSelectedLessonId}
                        searchable
                        styles={{
                            input: { backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)", color: "#fff" },
                            label: { color: "var(--color-text-muted)", marginBottom: 8 },
                            dropdown: { backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" },
                            option: { color: "var(--color-text)", "&[data-hovered]": { backgroundColor: "var(--color-bg)" } }
                        }}
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                        <GradientButton
                            onClick={() => setSaveModalOpen(false)}
                            style={{ background: "transparent", border: "1px solid var(--color-border)" }}
                        >
                            <span style={{ color: "var(--color-text-muted)" }}>Cancel</span>
                        </GradientButton>
                        <GradientButton
                            onClick={handleSaveConfirm}
                        >
                            {isSaving ? "Saving..." : "Confirm & Save"}
                        </GradientButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
