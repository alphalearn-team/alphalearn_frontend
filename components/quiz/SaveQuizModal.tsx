"use client";

import { useState, useEffect } from "react";
import { Modal, Select } from "@mantine/core";
import { showSuccess, showError } from "@/lib/actions/notifications";
import { Question } from "./types";
import { createQuizAction } from "@/lib/actions/quiz";
import { fetchMyLessonsAction } from "@/lib/actions/lesson";
import GradientButton from "../common/GradientButton";

interface SaveQuizModalProps {
    opened: boolean;
    onClose: () => void;
    questions: Question[];
}

export default function SaveQuizModal({ opened, onClose, questions }: SaveQuizModalProps) {
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [availableLessons, setAvailableLessons] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        if (opened && availableLessons.length === 0) {
            fetchMyLessonsAction().then((res) => {
                if (res.success && res.data) {
                    setAvailableLessons(res.data.map((lesson) => ({
                        value: lesson.lessonPublicId,
                        label: lesson.title
                    })));
                }
            });
        }
    }, [opened, availableLessons.length]);

    async function handleSaveConfirm() {
        if (!selectedLessonId) {
            showError("Please select a lesson to attach this quiz to.");
            return;
        }

        if (questions.length === 0) {
            showError("Add at least one question before saving.");
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
                title: "New Custom Quiz", // TODO: Add title input
                description: "Auto-generated quiz description.",
                lessonPublicId: selectedLessonId,
                questions: questions.map((q) => {
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

                    if (q.type === "single-choice") {
                        return {
                            ...base,
                            properties: {
                                options: q.options.map((o) => ({ id: o.id, text: o.text || "Empty Option" })),
                                correctOptionId: q.correctOptionId || q.options[0]?.id,
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

            showSuccess("Quiz saved successfully!");
            onClose();

        } catch (error) {
            console.error(error);
            showError(error instanceof Error ? error.message : "An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={() => !isSaving && onClose()}
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
                        onClick={() => onClose()}
                    >
                        <span>Cancel</span>
                    </GradientButton>
                    <GradientButton onClick={handleSaveConfirm}>
                        {isSaving ? "Saving..." : "Confirm & Save"}
                    </GradientButton>
                </div>
            </div>
        </Modal>
    );
}
