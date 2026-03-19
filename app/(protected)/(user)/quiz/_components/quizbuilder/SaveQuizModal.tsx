"use client";

import { useState, useEffect } from "react";
import { Modal, Select } from "@mantine/core";
import { showSuccess, showError } from "@/lib/data/notifications";
import { Question } from "./types";
import { createQuizAction } from "@/lib/actions/quiz";
import { fetchMyLessonsAction } from "@/lib/actions/lesson";
import GlowButton from "../../../../../../components/common/GlowButton";

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

    function validateQuiz(): string[] {
        const errors: string[] = [];

        if (questions.length === 0) {
            errors.push("Add at least one question before saving.");
        }

        questions.forEach((q, idx) => {
            const qNum = idx + 1;
            if (!q.prompt?.trim()) {
                errors.push(`Question ${qNum}: Prompt is required.`);
            }

            if (q.type === "multiple-choice") {
                if (q.options.length < 2) {
                    errors.push(`Question ${qNum} (Multi-Select): Requires at least 2 options.`);
                }
                if (q.correctOptionIds.length === 0) {
                    errors.push(`Question ${qNum} (Multi-Select): Select at least one correct answer.`);
                }
                const hasEmptyOption = q.options.some(o => !o.text?.trim());
                if (hasEmptyOption) {
                    errors.push(`Question ${qNum} (Multi-Select): All options must have text.`);
                }
            }

            if (q.type === "single-choice") {
                if (q.options.length < 2) {
                    errors.push(`Question ${qNum} (MCQ): Requires at least 2 options.`);
                }
                if (!q.correctOptionId) {
                    errors.push(`Question ${qNum} (MCQ): Select a correct answer.`);
                }
                const hasEmptyOption = q.options.some(o => !o.text?.trim());
                if (hasEmptyOption) {
                    errors.push(`Question ${qNum} (MCQ): All options must have text.`);
                }
            }
        });

        return errors;
    }

    async function handleSaveConfirm() {
        if (!selectedLessonId) {
            showError("Please select a lesson to attach this quiz to.");
            return;
        }

        const validationErrors = validateQuiz();
        if (validationErrors.length > 0) {
            // for now this shows one error only, can use the below code to show all at once
            showError(validationErrors[0]);
            // for (let error of validationErrors){
            //     showError(error);
            // }
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
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
            // console.log(JSON.stringify(payload));
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
                close: { color: "var(--color-text-muted)" }
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
                        option: { color: "var(--color-text)" }
                    }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                    <GlowButton
                        onClick={() => onClose()}
                    >
                        <span>Cancel</span>
                    </GlowButton>
                    <GlowButton onClick={handleSaveConfirm}>
                        {isSaving ? "Saving..." : "Confirm & Save"}
                    </GlowButton>
                </div>
            </div>
        </Modal>
    );
}
